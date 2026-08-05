import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Café — Order Online',
  description: 'Browse our menu and place your order directly in Telegram.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
