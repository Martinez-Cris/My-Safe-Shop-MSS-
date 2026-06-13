import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'MY SAFE SHOP <onboarding@resend.dev>',
      to: email,
      subject: 'Recuperación de contraseña - MY SAFE SHOP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 2rem;">
          <h2 style="color: #064e3b;">Recuperar contraseña</h2>
          <p>Recibimos una solicitud para restablecer tu contraseña.</p>
          <p>Haz clic en el botón para continuar. El enlace expira en <strong>30 minutos</strong>.</p>
          <a href="${resetUrl}"
            style="display:inline-block; background:#059669; color:white;
                   padding: 12px 24px; border-radius: 8px; text-decoration: none;
                   font-weight: bold; margin: 1rem 0;">
            Restablecer contraseña
          </a>
          <p style="color: #6b7280; font-size: 0.85rem;">
            Si no solicitaste esto, ignora este correo.
          </p>
        </div>
      `,
    });
  }
}