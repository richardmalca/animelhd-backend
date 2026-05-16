<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $url;

    public function __construct($url)
    {
        $this->url = $url;
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        \Illuminate\Support\Facades\Log::info('Worker is processing password reset email', [
            'email' => $notifiable->email
        ]);

        return (new MailMessage)
            ->subject('Recuperación de contraseña - ' . env('APP_NAME'))
            ->greeting('¡Hola!')
            ->line('Has recibido este correo porque hemos recibido una solicitud de restablecimiento de contraseña para tu cuenta.')
            ->action('Restablecer Contraseña', $this->url)
            ->line('Este enlace de restablecimiento de contraseña caducará en 60 minutos.')
            ->line('Si no has solicitado un restablecimiento de contraseña, no es necesario realizar ninguna otra acción.')
            ->salutation('Saludos, el equipo de ' . env('APP_NAME'));
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
