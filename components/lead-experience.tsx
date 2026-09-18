"use client";

import Image from "next/image";
import { useState, useSyncExternalStore, type FormEvent } from "react";

const VIDEO_URL = "https://youtu.be/BMQbF3xvaWo?si=OSA9pjvnOkzXBaV8";
const UNLOCK_KEY = "escalamed-aula-sucesso-cliente";

type SyncState = "idle" | "sending" | "sent" | "failed";
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

function subscribeToSession() { return () => {}; }
function sessionUnlocked() {
  try { return sessionStorage.getItem(UNLOCK_KEY) === "1"; } catch { return false; }
}
function serverUnlocked() { return false; }

export function LeadExperience() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const previouslyUnlocked = useSyncExternalStore(subscribeToSession, sessionUnlocked, serverUnlocked);
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
      setSyncState("sent");
      setPendingLead(null);
    } catch {
      setSyncState("failed");
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
    setUnlocked(true);
    try { sessionStorage.setItem(UNLOCK_KEY, "1"); } catch { /* The lesson remains available in this tab. */ }
    window.scrollTo({ top: 0, behavior: "auto" });
    void sendLead(lead);
  }

  if (unlocked || previouslyUnlocked) {
    return (
      <main className="lesson-shell">
        <header className="lesson-header">
          <Image src="/escalamed-logo-dark.png" alt="EscalaMed" width={675} height={120} priority className="brand-logo" />
          <span>AULA GRATUITA · X5 MED</span>
        </header>
        <section className="lesson-content" aria-label="Aula Sucesso do Cliente">
          <p className="eyebrow"><span /> SUA AULA ESTÁ LIBERADA</p>
          <h1>Sucesso do cliente <em>na clínica.</em></h1>
          <p className="lesson-intro">Uma experiência consistente começa ao entender o que o paciente busca e continua durante toda a jornada. Dê o play para aprender a estruturar esse acompanhamento.</p>
          <a className="video-frame" href={VIDEO_URL} target="_blank" rel="noopener noreferrer" aria-label="Assistir à aula gratuita Sucesso do Cliente no YouTube">
            <span className="video-label">X5 MED <i /> AULA GRATUITA</span>
            <strong>SUCESSO DO<br /><em>CLIENTE</em></strong>
            <span className="video-play" aria-hidden="true">▶</span>
            <span className="video-caption">ASSISTIR À AULA COMPLETA <span aria-hidden="true">↗</span></span>
          </a>
          <div className="lesson-actions">
            <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer" className="youtube-link">ABRIR AULA NO YOUTUBE <span aria-hidden="true">↗</span></a>
            <p className="sync-status" role="status" aria-live="polite">
              {syncState === "sending" && "Registrando seu acesso…"}
              {syncState === "sent" && "Acesso registrado."}
              {syncState === "failed" && <>A aula já está liberada. <button type="button" onClick={() => pendingLead && void sendLead(pendingLead)}>Tentar registrar novamente</button></>}
            </p>
          </div>
          <div className="lesson-outline">
            <p>O QUE VOCÊ VAI VER NA AULA</p>
            <div><span>01</span><strong>Primeiro contato</strong><small>Entenda as expectativas reais do paciente.</small></div>
            <div><span>02</span><strong>Acompanhamento ativo</strong><small>Mantenha a conexão ao longo do tratamento.</small></div>
            <div><span>03</span><strong>Consolidação</strong><small>Acompanhe a evolução e registre feedback.</small></div>
            <div><span>04</span><strong>Pós-sucesso</strong><small>Continue presente depois do resultado.</small></div>
          </div>
        </section>
      </main>
    );
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
            <div className="preview-bottom"><span>SUCESSO DO CLIENTE<br />NA CLÍNICA</span><span>ASSISTA<br />GRATUITAMENTE</span></div>
          </div>
          <footer className="brand-footer"><span /> PESSOAS. PROCESSOS. PACIENTES. RESULTADOS.</footer>
        </div>
      </section>

      <section className="form-panel" aria-label="Cadastro para acessar a aula gratuita">
        <div className="form-inner">
          <div className="form-topline"><span>ACESSO À AULA</span><span>GRATUITO E IMEDIATO</span></div>
          <form onSubmit={submit} className="lead-form">
            <p className="section-kicker">AULA GRATUITA PARA MÉDICOS</p>
            <h2>Uma clínica que acompanha <strong>cria relações mais fortes<span>.</span></strong></h2>
            <p className="form-intro">Conheça as etapas para estruturar a jornada do paciente, organizar o acompanhamento e manter a conexão após o tratamento. Preencha seus dados e assista agora.</p>
            <div className="fields">
              <label className="field"><span>Nome completo <b>*</b></span><input name="name" type="text" autoComplete="name" placeholder="Como podemos chamar você?" required minLength={2} maxLength={180} value={name} onChange={e => setName(e.target.value)} /></label>
              <label className="field"><span>E-mail <b>*</b></span><input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required maxLength={240} value={email} onChange={e => setEmail(e.target.value)} /></label>
              <label className="field"><span>WhatsApp com DDD <b>*</b></span><input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" required minLength={10} maxLength={25} value={phone} onChange={e => setPhone(e.target.value)} /></label>
              <label className="field"><span>Instagram <b>*</b></span><input name="instagram" type="text" autoComplete="off" placeholder="@seuperfil" required maxLength={100} value={instagram} onChange={e => setInstagram(e.target.value)} /><small>Você pode informar seu @ ou o link do perfil.</small></label>
            </div>
            <label className="honeypot" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button" type="submit"><span>ASSISTIR À AULA GRATUITA</span><span className="button-arrow" aria-hidden="true">↗</span></button>
          </form>
          <p className="data-footnote">Seus dados serão registrados pela EscalaMed para disponibilizar esta aula.</p>
        </div>
      </section>
    </main>
  );
}
