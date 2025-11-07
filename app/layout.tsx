import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Role Directory',
  description: 'Global Role Directory Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

