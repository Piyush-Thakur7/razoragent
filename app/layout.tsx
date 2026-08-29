import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RazorAgent by Resence — Bounded MCP Commerce Gateway',
  description: 'Model Context Protocol (MCP) gateway that makes any merchant catalog transactable for AI shopping agents with deterministic guardrails and Razorpay settlement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark antialiased">
      <body className="min-h-screen bg-[#07090F] text-slate-100 font-sans antialiased selection:bg-[#0C8CE9]/30">
        {children}
      </body>
    </html>
  );
}
