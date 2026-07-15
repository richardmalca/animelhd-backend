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

    {{--
    <script>
        (function(s){
            s.dataset.zone='11039557',
            s.src='https://al5sm.com/tag.min.js'
        })([document.documentElement, document.body]
            .filter(Boolean)
            .pop()
            .appendChild(document.createElement('script')))
    </script>
    --}}
</body>
</html>
