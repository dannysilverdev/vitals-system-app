// app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/components/AuthProvider';
import ExposeSupabaseClient from '@/components/ExposeSupabaseClient';

export const metadata = { title: 'Mi App' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {/* Este componente solo expone el cliente en window para debug */}
          <ExposeSupabaseClient />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
