const METRICS_BASE_URL = (process.env.METRICS_BASE_URL || "https://metrics.x5med.com.br").replace(/\/$/, "");
const FUNNEL_NAME = "funil_ganchos";
let cachedFunnel: { id: string; until: number } | null = null;

export type Lead = {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

async function getFunnelId(key: string) {
  const override = process.env.METRICS_FUNNEL_ID?.trim();
  if (override) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(override)) throw new Error("METRICS_FUNNEL_ID inválido.");
    return override;
  }
  if (cachedFunnel && cachedFunnel.until > Date.now()) return cachedFunnel.id;
  const response = await fetch(`${METRICS_BASE_URL}/api/endomax/funnels?quick=1`, {
    headers: { "x-api-key": key }, cache: "no-store", signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Consulta do funil falhou (${response.status}).`);
  const data = await response.json() as { custom?: Array<{ id?: string; name?: string }> };
  const matches = (data.custom || []).filter(funnel => funnel.name === FUNNEL_NAME && funnel.id);
  if (matches.length !== 1) throw new Error(`Funil ${FUNNEL_NAME} não encontrado de forma única.`);
  const id = matches[0].id as string;
  cachedFunnel = { id, until: Date.now() + 10 * 60_000 };
  return id;
}

export async function sendToMetrics(lead: Lead) {
  const key = process.env.METRICS_API_KEY?.trim();
  if (!key) throw new Error("METRICS_API_KEY não configurada.");
  const funnelId = await getFunnelId(key);
  const response = await fetch(`${METRICS_BASE_URL}/api/endomax/lead`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key },
    body: JSON.stringify({
      origem: `custom:${funnelId}`,
      nome: lead.name,
      email: lead.email,
      whatsapp: lead.phone,
      instagram: lead.instagram,
      utm_source: lead.utmSource,
      utm_medium: lead.utmMedium,
      utm_campaign: lead.utmCampaign,
      ref: lead.referrer,
      status: "Lead In",
      notes: "Solicitou acesso à aula gratuita Sucesso do Cliente na Clínica. Equipe comercial deve entrar em contato pelo WhatsApp informado para encaminhar a aula.",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Cadastro no Metrics falhou (${response.status}).`);
  const result = await response.json() as { ok?: boolean; lead?: { id?: string } };
  if (!result.ok || !result.lead?.id) throw new Error("Metrics não confirmou o cadastro.");
  return result.lead.id;
}
