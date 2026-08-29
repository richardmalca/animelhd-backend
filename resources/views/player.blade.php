<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reproductor</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            overflow: hidden;
            background-color: #000;
        }

        iframe {
            border: none;
            height: 100%;
            width: 100%;
        }

        #vx-layer {
            position: fixed;
            inset: 0;
            z-index: 10;
            background: transparent;
        }
    </style>
</head>
<body>
    <iframe src="{{ $url }}" allowfullscreen scrolling="no" allow="autoplay; fullscreen"></iframe>
    <div id="vx-layer"></div>
    <script>
        (function () {
            var overlay = document.getElementById('vx-layer');
            var opened = false;
            var key = 'vx_last_open';
            var limitMs = 10 * 60 * 1000;

            overlay.addEventListener('click', function onFirstClick() {
                overlay.removeEventListener('click', onFirstClick);
                overlay.remove();

                if (opened) return;
                opened = true;

                var now = Date.now();
                try {
                    var last = Number(localStorage.getItem(key) || 0);
                    if (now - last < limitMs) return;
                    localStorage.setItem(key, String(now));
                } catch (e) {}

                var w = window.open('https://doubtfulimpatient.com/xa2u7b99?key=3670577d3cd84a69c877487b53766382', '_blank');
                if (w) window.focus();
            });
        })();
    </script>
</body>
</html>
