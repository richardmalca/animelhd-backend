import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useRealtimeStatus } from './use-realtime-status';

export function useReverbGuard() {
    const isActive = useRealtimeStatus();
    const isDown = !isActive;

    return { isDown };
}
