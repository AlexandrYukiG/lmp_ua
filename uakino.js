// uakino.js
(function () {
    'use strict';

    // Маніфест плагіна
    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Uakino.best',
        description: 'Відтворення з uakino.best',
        component: 'uakino'
    };

    // Ініціалізація
    function startPlugin() {
        Lampa.Component.add('uakino', component);
        Lampa.Manifest.plugins = manifest;

        // Реєстрація джерела
        Lampa.Player.registerSource({
            id: 'uakino',
            name: 'Uakino.best',
            priority: 10,
            play: function (data, callback) {
                var movieUrl = 'https://uakino.best/search?query=' + encodeURIComponent(data.title || data.movie.title);
                var proxy = 'https://cors-anywhere.herokuapp.com/';
                var requestUrl = proxy + movieUrl;

                Lampa.Network.timeout(10000);
                Lampa.Network.silent(requestUrl, function (response) {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(response, 'text/html');

                    // Спроба знайти <iframe>, який може містити джерело
                    var iframeSrc = doc.querySelector('iframe')?.src || '';
                    if (iframeSrc) {
                        // Якщо знайдено iframe, робимо додатковий запит
                        Lampa.Network.silent(proxy + iframeSrc, function (iframeResponse) {
                            var iframeDoc = parser.parseFromString(iframeResponse, 'text/html');
                            var videoSource = iframeDoc.querySelector('video source')?.src || iframeDoc.querySelector('iframe')?.src || '';

                            if (videoSource) {
                                callback({
                                    sources: [{ url: videoSource, quality: 'auto', name: 'Uakino.best' }],
                                    title: data.title || data.movie.title
                                });
                            } else {
                                callback(null); // Не знайдено джерело
                            }
                        }, function () {
                            callback(null); // Помилка при запиті до iframe
                        });
                    } else {
                        callback(null); // Не знайдено ні video, ні iframe
                    }
                }, function () {
                    callback(null); // Помилка основного запиту
                }, false, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Tizen; Smart TV) AppleWebKit/537.36' }
                });
            }
        });
    }

    // Компонент
    function component() {
        this.start = function () {
            Lampa.Controller.toggle('content');
        };
        this.destroy = function () {
            Lampa.Network.clear();
        };
    }

    // Запуск
    if (!window.uakino_plugin) {
        window.uakino_plugin = true;
        startPlugin();
    }
})();
