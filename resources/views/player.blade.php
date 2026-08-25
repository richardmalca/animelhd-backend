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
    </style>
</head>
<body>
    <iframe src="{{ $url }}" allowfullscreen scrolling="no" allow="autoplay; fullscreen"></iframe>
    <script>
        (function () {
            var opened = false;

            document.addEventListener('click', function onFirstClick() {
                document.removeEventListener('click', onFirstClick, true);

                if (opened) return;
                opened = true;

                window.open(
                    'https://www.profitableratecpmnetwork.com/xa2u7b99?key=3670577d3cd84a69c877487b53766382',
                    '_blank'
                );
            }, true);
        })();
    </script>
</body>
</html>
