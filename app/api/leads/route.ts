import { NextResponse } from "next/server";
import { sendToMetrics } from "@/lib/metrics";

export const runtime = "nodejs";

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const raw = await request.text().catch(() => "");
  if (raw.length > 8_000) return NextResponse.json({ error: "Dados muito grandes." }, { status: 413 });
  let body: Record<string, unknown> | null = null;
  try { body = JSON.parse(raw); } catch { /* Invalid JSON is handled below. */ }
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  if (text(body.website, 100)) return NextResponse.json({ ok: true }, { status: 202 });

  const lead = {
    name: text(body.name, 180),
    email: text(body.email, 240).toLowerCase(),
    phone: text(body.phone, 40).replace(/\D/g, ""),
    instagram: text(body.instagram, 120).replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, ""),
    utmSource: text(body.utmSource, 120) || "aula_sucesso_cliente",
    utmMedium: text(body.utmMedium, 120) || "site",
    utmCampaign: text(body.utmCampaign, 160) || "aula_sucesso_cliente",
    referrer: text(body.referrer, 500),
    pageUrl: text(body.pageUrl, 500),
    formSubmissionId: text(body.formSubmissionId, 36),
    whatsappConsent: body.whatsappConsent === true,
  };
  if (lead.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || lead.phone.length < 10 || lead.phone.length > 13 || !/^[A-Za-z0-9._]{1,30}$/.test(lead.instagram) || typeof body.whatsappConsent !== "boolean" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lead.formSubmissionId) || !/^https?:\/\//i.test(lead.pageUrl)) {
    return NextResponse.json({ error: "Revise nome, e-mail, WhatsApp e Instagram." }, { status: 400 });
  }

  try {
    await sendToMetrics(lead);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("[Aula EscalaMed] Falha de sincronização:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Não foi possível registrar o cadastro." }, { status: 502 });
  }
}
