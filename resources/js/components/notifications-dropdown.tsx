import { Bell, AlertCircle, Info, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useNotifications } from '@/hooks/use-notifications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationsDropdown() {
    const { notifications, removeNotification, clearNotifications } = useNotifications();
    const count = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-transparent">
                    <Bell className={cn("h-[1.2rem] w-[1.2rem] transition-all", count > 0 ? "text-primary animate-pulse" : "text-muted-foreground")} />
                    {count > 0 && (
                        <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden border-border/50 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                    <DropdownMenuLabel className="p-0 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Notificaciones
                    </DropdownMenuLabel>
                    {count > 0 && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); clearNotifications(); }}
                            className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-tight"
                        >
                            Limpiar todo
                        </button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <div className="max-h-[350px] overflow-y-auto">
                    {count === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-6">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Bell className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Sin alertas pendientes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="group relative flex gap-4 px-4 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="mt-0.5 shrink-0">
                                        {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                                        {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                                        {notification.type === 'info' && <Info className="h-4 w-4 text-primary" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <p className="text-sm leading-snug font-medium text-foreground/90 break-words pr-4">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-medium text-muted-foreground/60">
                                                {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {notification.action && (
                                                <Link 
                                                    href={notification.action.href}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:opacity-80 transition-opacity"
                                                >
                                                    {notification.action.label}
                                                    <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeNotification(notification.id)}
                                        className="absolute top-4 right-2 h-5 w-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all text-muted-foreground"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
