// uakino_best_plugin.js
(function () {
    'use strict';

    // Маніфест плагіна
    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Uakino.best',
        description: 'Відтворення фільмів і серіалів із uakino.best',
        component: 'uakino_best'
    };

    // Ініціалізація плагіна
    function startPlugin() {
        Lampa.Component.add('uakino_best', component);
        Lampa.Manifest.plugins = manifest;

        // Додаємо uakino.best як джерело для відтворення
        Lampa.Player.registerSource({
            id: 'uakino_best',
            name: 'Uakino.best',
            priority: 10,
            play: function (data, callback) {
                fetchVideo(data, callback);
            }
        });
    }

    // Компонент для обробки запитів
    function component(object) {
        var network = new Lampa.Reguest();

        this.search = function () {
            // Пошук поки не підтримується, але можна додати пізніше
            Lampa.Noty.show('Пошук у розробці');
        };

        this.start = function () {
            Lampa.Controller.toggle('content');
        };

        this.destroy = function () {
            network.clear();
        };
    }

    // Функція для витягнення відео
    function fetchVideo(data, callback) {
        // Отримуємо URL фільму з об’єкта data (наприклад, передане користувачем посилання)
        var movieUrl = data.url || data.movie.url || 'https://uakino.best' + (data.movie.url || '');

        // Додаємо проксі для обходу CORS (якщо потрібно)
        var proxy = 'https://cors-anywhere.herokuapp.com/';
        var requestUrl = movieUrl.includes('http') ? movieUrl : proxy + movieUrl;

        network.timeout(10000);
        network.silent(requestUrl, function (response) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(response, 'text/html');

            // Шукаємо посилання на відео (HLS, MP4 або iframe)
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
                    title: data.title || data.movie.title || 'Uakino.best',
                    poster: data.poster || data.movie.poster || 'https://uakino.best/default_poster.jpg'
                });
            } else {
                Lampa.Noty.show('Посилання на відео не знайдено');
                callback(null);
            }
        }, function () {
            Lampa.Noty.show('Помилка завантаження сторінки uakino.best');
            callback(null);
        }, false, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Tizen; Smart TV) AppleWebKit/537.36'
            }
        });
    }

    // Додаємо стилі (спрощені, адаптовані з online.js)
    Lampa.Template.add('uakino_best_css', `
        <style>
            .uakino-best-button {
                background: rgba(0,0,0,0.3);
                padding: 0.5em 1.2em;
                border-radius: 0.2em;
                margin-bottom: 1em;
            }
            .uakino-best-button.focus {
                background: #fff;
                color: black;
            }
        </style>
    `);
    $('body').append(Lampa.Template.get('uakino_best_css', {}, true));

    // Додаємо кнопку в картку фільму
    var button = `
        <div class="full-start__button selector view--online uakino-best-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Дивитися на Uakino.best</span>
        </div>
    `;

    Lampa.Listener.follow('full', function (e) {
        if (e.type == 'complite') {
            var btn = $(Lampa.Lang.translate(button));
            btn.on('hover:enter', function () {
                Lampa.Activity.push({
                    url: 'https://uakino.best/search?query=' + encodeURIComponent(e.data.movie.title),
                    title: 'Uakino.best - ' + e.data.movie.title,
                    component: 'uakino_best',
                    movie: e.data.movie,
                    page: 1
                });
            });
            e.object.activity.render().find('.view--torrent').after(btn);
        }
    });

    // Запускаємо плагін
    if (!window.uakino_best_plugin) {
        window.uakino_best_plugin = true;
        startPlugin();
    }
})();
