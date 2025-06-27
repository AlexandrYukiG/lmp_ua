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

                    // Спроба знайти <iframe> або <video>
                    var iframeSrc = doc.querySelector('iframe')?.src || '';
                    if (iframeSrc) {
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

        // Додаємо кнопку "Дивитись на Uakino.best"
        var button = `
            <div class="full-start__button selector view--online">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5v14l11-7z"/>
                </svg>
                <span>Дивитись на Uakino.best</span>
            </div>
        `;

        Lampa.Listener.follow('full', function (e) {
            if (e.type == 'complite') {
                var btn = $(Lampa.Lang.translate(button));
                btn.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: 'https://uakino.best/search?query=' + encodeURIComponent(e.data.movie.title),
                        title: 'Uakino.best - ' + e.data.movie.title,
                        component: 'uakino',
                        movie: e.data.movie,
                        page: 1
                    });
                });
                e.object.activity.render().find('.view--torrent').after(btn);
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
