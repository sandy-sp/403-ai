import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: '403 AI - Forbidden AI',
  description:
    'A platform dedicated to sharing AI research, conducting discussions, publishing AI news, and exploring forbidden knowledge in the AI/ML space.',
  keywords: ['AI', 'Machine Learning', 'Research', 'Forbidden AI', 'AI News'],
  authors: [{ name: '403 AI' }],
  openGraph: {
    title: '403 AI - Forbidden AI',
    description:
      'Exploring forbidden knowledge in AI/ML space. AI research, discussions, and news.',
    url: 'https://www.403-ai.com',
    siteName: '403 AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '403 AI - Forbidden AI',
    description: 'Exploring forbidden knowledge in AI/ML space.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
