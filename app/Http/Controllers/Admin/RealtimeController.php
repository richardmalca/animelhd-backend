<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\SystemService;
use Inertia\Inertia;

class RealtimeController extends Controller
{
    protected $service;

    public function __construct(SystemService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('admin/settings/realtime/index', [
            'status' => $this->service->getRealtimeStatus()
        ]);
    }

    public function data()
    {
        return response()->json($this->service->getRealtimeStatus());
    }

    public function start()
    {
        $this->service->startReverb();
        $this->waitForPortToOpen();
        return back();
    }

    private function waitForPortToOpen()
    {
        $port = env('REVERB_PORT', 8080);
        $attempts = 0;
        
        while ($attempts < 30) {
            if ($this->isPortOpenOnWindows($port) || $this->isPortOpenOnLinux($port)) {
                break;
            }
            usleep(100000);
            $attempts++;
        }
    }

    private function isPortOpenOnWindows($port)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
            return false;
        }
        
        $output = shell_exec("netstat -ano | findstr :$port");
        return !empty($output) && strpos($output, 'LISTENING') !== false;
    }

    private function isPortOpenOnLinux($port)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            return false;
        }

        $host = env('REVERB_HOST', '127.0.0.1');
        $target = $host === 'localhost' ? '127.0.0.1' : $host;
        
        $fp = @fsockopen($target, $port, $errno, $errstr, 0.1);
        
        if ($fp) {
            fclose($fp);
            return true;
        }
        
        return false;
    }

    public function stop()
    {
        $this->service->stopReverb();
        return back();
    }
}
