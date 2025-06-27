// uakino.js
(function () {
    'use strict';

    // Маніфест плагіна
    var manifest = {
        type: 'video',
        version: '1.0.0',
        name: 'Uakino.best',
        description: 'Тестування відтворення з uakino.best',
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
                // Тестове джерело для перевірки
                var testUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
                callback({
                    sources: [{ url: testUrl, quality: 'auto', name: 'Uakino.best Test' }],
                    title: data.title || data.movie.title || 'Тестовий потік'
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
