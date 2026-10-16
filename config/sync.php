<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sincronización incremental para las apps (GET /api/sync)
    |--------------------------------------------------------------------------
    |
    | settle_seconds: los cambios recién registrados se publican pasados unos
    | segundos. Así una escritura que aún no confirmó su transacción no queda
    | "por detrás" del cursor de un cliente que ya leyó cambios más nuevos.
    |
    | default_limit / max_limit: cuántos cambios devuelve cada página.
    |
    */

    'settle_seconds' => (int) env('SYNC_SETTLE_SECONDS', 3),

    /*
    | reconcile_interval: cada cuántos segundos, como mucho, /api/sync revisa si otras apps escribieron en la base
    | de datos sin pasar por esta (0 lo desactiva). reconcile_full_interval: cada cuántos segundos se revisan
    | además huecos y borrados, que cruzan las tablas completas.
    */

    'reconcile_interval' => (int) env('SYNC_RECONCILE_INTERVAL', 60),

    'reconcile_full_interval' => (int) env('SYNC_RECONCILE_FULL_INTERVAL', 3600),

    /* reconcile_batch: tope de filas que anota cada pasada rápida por entidad; un atraso grande se reparte. */

    'reconcile_batch' => (int) env('SYNC_RECONCILE_BATCH', 2000),

    /*
    | Protección contra muchas peticiones a la vez (por ejemplo, al subirse un capítulo y abrir la app miles de
    | personas): page_cache_seconds guarda cada página armada ese tiempo (0 lo desactiva); max_concurrent es cuántas
    | páginas pueden armarse a la vez contra la base de datos (0 sin tope); queue_wait_seconds es cuánto espera una
    | petición su turno antes de recibir 503 con Retry-After.
    */

    'page_cache_seconds' => (int) env('SYNC_PAGE_CACHE_SECONDS', 60),

    'max_concurrent' => (int) env('SYNC_MAX_CONCURRENT', 32),

    'queue_wait_seconds' => (float) env('SYNC_QUEUE_WAIT_SECONDS', 3),

    'default_limit' => 5000,

    'max_limit' => 10000,

];
