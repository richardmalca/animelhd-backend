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

    'default_limit' => 5000,

    'max_limit' => 10000,

];
