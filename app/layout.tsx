import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CPSFLOW — Atendimento e vendas com IA no WhatsApp",
  description:
    "A plataforma que une IA, automação e CRM para responder, qualificar leads e fechar vendas no WhatsApp 24 horas por dia.",
  keywords: [
    "WhatsApp",
    "IA",
    "automação",
    "CRM",
    "atendimento",
    "vendas",
    "chatbot",
    "CPSFLOW",
  ],
  openGraph: {
    title: "CPSFLOW — Atendimento e vendas com IA no WhatsApp",
    description:
      "Transforme conversas do WhatsApp em vendas no automático com IA, flow builder visual e CRM.",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
