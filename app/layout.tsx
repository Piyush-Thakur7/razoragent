import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RazorAgent — Bounded MCP Commerce & Settlement Gateway for Autonomous AI Buyers',
  description: 'Model Context Protocol (MCP) gateway that makes any merchant catalog transactable for AI shopping agents with deterministic guardrails and Razorpay settlement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#07090F] text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
