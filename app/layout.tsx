import type { Metadata } from "next";
import { Anton, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });
const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });

export const metadata: Metadata = {
  title: "Aula gratuita: Sucesso do Cliente na Clínica | EscalaMed",
  description: "Aprenda a acompanhar a jornada do paciente, alinhar expectativas e criar uma experiência mais consistente na sua clínica. Acesse a aula gratuita da EscalaMed.",
  openGraph: {
    title: "Aula gratuita: Sucesso do Cliente na Clínica | EscalaMed",
    description: "Da primeira conversa ao pós-tratamento: conheça as etapas de uma jornada do paciente mais consistente.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${sora.variable} ${anton.variable}`}>{children}</body></html>;
}
