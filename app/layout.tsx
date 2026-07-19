import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import { NavbarWrapper } from "@/components/layout/navbar-wrapper";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Trackee - Precision Financial Monitoring', 
  description: 'Track your income, expenses, and financial health with precision.',
  applicationName: "Trackee",
  authors: [{ name: "" }],
  creator: "",
  publisher: "",
  keywords: [
    "Trackee",
    "Finance",
    "Expense Tracker",
    "Budget",
    "Money Management",
    "Next.js",
    "Supabase",
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body className={`${plusJakartaSans.className} antialiased selection:bg-blue-500/20`}>
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}