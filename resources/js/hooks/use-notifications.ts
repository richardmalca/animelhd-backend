import { useState, useEffect, useCallback } from 'react';

export type Notification = {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'info';
    timestamp: number;
    tag?: string;
    action?: {
        label: string;
        href: string;
    };
};

let notificationsStore: Notification[] = [];
const listeners = new Set<(notifications: Notification[]) => void>();

const emit = () => {
    listeners.forEach((listener) => listener([...notificationsStore]));
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>(notificationsStore);

    useEffect(() => {
        const listener = (newNotifications: Notification[]) => {
            setNotifications(newNotifications);
        };
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    const addNotification = useCallback((notification: Omit<Notification, 'timestamp' | 'id'> & { id?: string }) => {
        const id = notification.id || Math.random().toString(36).substring(7);
        
        if (notification.tag && notificationsStore.some(n => n.tag === notification.tag)) {
            return;
        }

        notificationsStore = [
            ...notificationsStore,
            {
                ...notification,
                id,
                timestamp: Date.now(),
            },
        ];
        emit();
    }, []);

    const removeNotification = useCallback((id: string) => {
        notificationsStore = notificationsStore.filter((n) => n.id !== id);
        emit();
    }, []);

    const removeNotificationByTag = useCallback((tag: string) => {
        notificationsStore = notificationsStore.filter((n) => n.tag !== tag);
        emit();
    }, []);

    const clearNotifications = useCallback(() => {
        notificationsStore = [];
        emit();
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        removeNotificationByTag,
        clearNotifications,
    };
}

export const initializeNotifications = (reverbActive: boolean) => {
    if (!reverbActive && !notificationsStore.some(n => n.tag === 'reverb')) {
        notificationsStore = [{
            id: 'reverb-error',
            message: 'Se necesita activar Reverb para algunas funciones... el sistema no está completo sin eso.',
            type: 'error',
            tag: 'reverb',
            timestamp: Date.now(),
            action: {
                label: 'Activar ahora',
                href: '/admin/settings/realtime'
            }
        }];
    } else if (reverbActive) {
        notificationsStore = notificationsStore.filter(n => n.tag !== 'reverb');
    }
};
