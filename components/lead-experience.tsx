"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

type SyncState = "idle" | "sending" | "registered" | "registration_failed";
type Lead = {
  name: string;
  email: string;
  phone: string;
  instagram: string;
  website: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
};

function normalizeInstagram(value: string) {
  return value.trim().replace(/^https?:\/\/(?:www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "");
}

function attribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get("utm_source") || "aula_sucesso_cliente",
    utmMedium: params.get("utm_medium") || "site",
    utmCampaign: params.get("utm_campaign") || "aula_sucesso_cliente",
    referrer: document.referrer || window.location.href,
  };
}

export function LeadExperience() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [pendingLead, setPendingLead] = useState<Lead | null>(null);
  const [formError, setFormError] = useState("");

  async function sendLead(lead: Lead) {
    setSyncState("sending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
        cache: "no-store",
        keepalive: true,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setSyncState("registered");
      setPendingLead(null);
    } catch {
      setSyncState("registration_failed");
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const digits = phone.replace(/\D/g, "");
    const handle = normalizeInstagram(instagram);
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || digits.length < 10 || digits.length > 13 || !/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
      setFormError("Revise nome, e-mail, WhatsApp com DDD e Instagram.");
      return;
    }
    const lead = { name: name.trim(), email: email.trim(), phone: digits, instagram: handle, website, ...attribution() };
    setPendingLead(lead);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "auto" });
    void sendLead(lead);
  }

  return (
    <main className="page-shell">
      <section className="brand-panel" aria-label="Apresentação da aula">
        <div className="brand-grid" aria-hidden="true" />
        <div className="brand-halo" aria-hidden="true" />
        <div className="brand-inner">
          <header className="brand-header">
            <Image src="/escalamed-logo-dark.png" alt="EscalaMed" width={675} height={120} priority className="brand-logo" />
            <span className="header-tag">MÉDICOS MAIS FORTES <i /> CLÍNICAS MAIS GRANDES</span>
          </header>
          <div className="hero-copy">
            <p className="eyebrow"><span /> AULA GRATUITA · X5 MED</p>
            <h1>O PACIENTE<br />NÃO TERMINA<br /><em>NA CONSULTA.</em></h1>
            <p className="hero-lead">Sucesso do cliente é uma jornada. Não um contato isolado.</p>
            <p className="hero-description">Aprenda a alinhar expectativas, acompanhar cada etapa e fortalecer a relação com o paciente antes, durante e depois do tratamento.</p>
          </div>
          <div className="class-preview" aria-hidden="true">
            <div className="preview-top"><span>ESCALAMED / AULA 01</span><span>↗</span></div>
            <div className="preview-play">▶</div>
            <div className="preview-bottom"><span>SUCESSO DO CLIENTE<br />NA CLÍNICA</span><span>ACESSO PELO<br />WHATSAPP</span></div>
          </div>
          <footer className="brand-footer"><span /> PESSOAS. PROCESSOS. PACIENTES. RESULTADOS.</footer>
        </div>
      </section>

      <section className="form-panel" aria-label="Cadastro para receber a aula gratuita pelo WhatsApp">
        <div className="form-inner">
          <div className="form-topline"><span>AULA GRATUITA</span><span>CONTATO PELO WHATSAPP</span></div>
          {submitted ? (
            <div className="success-panel" aria-live="polite">
              <div className={`success-icon${syncState === "registration_failed" ? " success-icon-error" : ""}`} aria-hidden="true">{syncState === "registration_failed" ? "!" : "✓"}</div>
              <p className="section-kicker">{syncState === "registration_failed" ? "PEDIDO NÃO REGISTRADO" : "PEDIDO RECEBIDO"}</p>
              <h2>{syncState === "registration_failed" ? "Seu pedido precisa de atenção" : "Pedido recebido"}, {name.trim().split(/\s+/)[0]}<span>.</span></h2>
              <p className="success-copy">{syncState === "registration_failed" ? "Confira abaixo o estado do seu pedido." : <>Nossa equipe comercial entrará em contato pelo WhatsApp informado para encaminhar o acesso à aula gratuita <strong>Sucesso do Cliente na Clínica</strong>.</>}</p>
              <div className={`sync-status sync-${syncState}`} role="status">
                {syncState === "sending" && <><span className="status-spinner" /> Registrando seu pedido…</>}
                {syncState === "registered" && <><span className="status-check">✓</span> Cadastro registrado. Aguarde o contato da nossa equipe.</>}
                {syncState === "registration_failed" && <><span className="status-warning">!</span> Não foi possível registrar o pedido. <button type="button" onClick={() => pendingLead && void sendLead(pendingLead)}>Tentar novamente</button></>}
              </div>
            </div>
          ) : <form onSubmit={submit} className="lead-form">
            <p className="section-kicker">AULA GRATUITA PARA MÉDICOS</p>
            <h2>Uma clínica que acompanha <strong>cria relações mais fortes<span>.</span></strong></h2>
            <p className="form-intro">Conheça as etapas para estruturar a jornada do paciente, organizar o acompanhamento e manter a conexão após o tratamento. Preencha seus dados e nossa equipe comercial enviará o acesso à aula pelo WhatsApp.</p>
            <div className="fields">
              <label className="field"><span>Nome completo <b>*</b></span><input name="name" type="text" autoComplete="name" placeholder="Como podemos chamar você?" required minLength={2} maxLength={180} value={name} onChange={e => setName(e.target.value)} /></label>
              <label className="field"><span>E-mail <b>*</b></span><input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength={240} value={email} onChange={e => setEmail(e.target.value)} /></label>
              <label className="field"><span>WhatsApp com DDD <b>*</b></span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" required minLength={10} maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} /><small>Nossa equipe comercial entrará em contato por este número.</small></label>
              <label className="field"><span>Instagram <b>*</b></span><input name="instagram" type="text" autoComplete="off" placeholder="@seuperfil" required maxLength={100} value={instagram} onChange={e => setInstagram(e.target.value)} /><small>Você pode informar seu @ ou o link do perfil.</small></label>
            </div>
            <label className="honeypot" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button" type="submit"><span>SOLICITAR AULA PELO WHATSAPP</span><span className="button-arrow" aria-hidden="true">↗</span></button>
          </form>}
          <p className="data-footnote">Seus dados serão registrados pela EscalaMed para que a equipe comercial entre em contato sobre a aula solicitada. <a href="https://metrics.x5med.com.br/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade ↗</a></p>
        </div>
      </section>
    </main>
  );
}
