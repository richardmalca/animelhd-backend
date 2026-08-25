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
    <iframe
        src="{{ $url }}"
        allowfullscreen
        scrolling="no"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-orientation-lock"
    ></iframe>
    <script>
        // Limita el popup del ad a una sola apertura por carga de página.
        // El tag de Monetag no trae un límite propio y puede intentar abrir
        // una ventana en cada click; esto neutraliza los intentos siguientes
        // sin tocar los listeners de click, así el iframe sigue reaccionando.
        (function () {
            var used = false;
            var originalOpen = window.open;
            window.open = function () {
                if (used) return null;
                used = true;
                return originalOpen.apply(window, arguments);
            };
        })();
    </script>
    <script>(function(s){s.dataset.zone='11039557',s.src='https://llvpn.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))</script>
</body>
</html>
