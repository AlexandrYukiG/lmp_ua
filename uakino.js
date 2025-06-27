// uakino_best_plugin.js
(function () {
    'use strict';

    // Маніфест плагіна
    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Uakino.best',
        description: 'Відтворення фільмів із uakino.best',
        component: 'uakino_best'
    };

    // Ініціалізація
    function init() {
        Lampa.Plugin.register(manifest);

        // Реєстрація плагіна як джерела для відтворення
        Lampa.Player.registerSource({
            id: 'uakino_best',
            name: 'Uakino.best',
            priority: 10,
            play: function (data, callback) {
                fetchVideo(data, callback);
            }
        });
    }

    // Функція для витягнення відео
    function fetchVideo(data, callback) {
        // Використовуємо URL фільму, який передає Lampa
        var movieUrl = data.url || data.movie.url;

        Lampa.Network.request({
            url: movieUrl,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Tizen; Smart TV) AppleWebKit/537.36'
            },
            success: function (response) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(response, 'text/html');

                // Шукаємо iframe або video з посиланням на потік
                var videoSource = doc.querySelector('video source')?.src ||
                                 doc.querySelector('iframe')?.src ||
                                 '';

                if (videoSource) {
                    // Повертаємо дані для відтворення
                    callback({
                        sources: [{
                            url: videoSource,
                            quality: 'auto',
                            name: 'Uakino.best'
                        }],
                        title: data.title || data.movie.title,
                        poster: data.poster || data.movie.poster
                    });
                } else {
                    Lampa.Noty.show('Посилання на відео не знайдено');
                    callback(null);
                }
            },
            error: function () {
                Lampa.Noty.show('Помилка завантаження сторінки uakino.best');
                callback(null);
            }
        });
    }

    init();
})();