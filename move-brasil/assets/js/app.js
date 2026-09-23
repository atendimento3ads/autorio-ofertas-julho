(() => {
  "use strict";

  const siteStylesheet = document.querySelector("#site-css");
  if (siteStylesheet) siteStylesheet.media = "all";

  const consentKey = "autorio_tracking_consent_v1";
  let savedConsent = "pending";
  try { savedConsent = window.localStorage.getItem(consentKey) || "pending"; } catch {}
  const consentPanel = document.createElement("section");
  consentPanel.className = "consent-panel";
  consentPanel.setAttribute("aria-label", "Preferências de privacidade");
  consentPanel.setAttribute("aria-live", "polite");
  consentPanel.innerHTML = `<div><strong>Privacidade e medição</strong><p>Usamos cookies opcionais para medir campanhas e melhorar a experiência. Você pode aceitar ou recusar. Os cookies necessários continuam ativos.</p><p><a href="../politica-de-privacidade.html">Política de Privacidade</a> · <a href="../termos-de-uso.html">Termos de Uso</a></p></div><div class="consent-panel__actions"><button type="button" data-consent="rejected">Recusar opcionais</button><button type="button" class="is-primary" data-consent="accepted">Aceitar opcionais</button></div>`;
  document.body.appendChild(consentPanel);
  const preferencesButton = document.createElement("button");
  preferencesButton.type = "button";
  preferencesButton.className = "privacy-preferences";
  preferencesButton.textContent = "Privacidade";
  preferencesButton.setAttribute("aria-label", "Reabrir preferências de privacidade");
  document.body.appendChild(preferencesButton);
  const setConsent = (choice) => {
    try { window.localStorage.setItem(consentKey, choice); } catch {}
    window.autorioUpdateConsent?.(choice === "accepted");
    consentPanel.hidden = true;
    preferencesButton.hidden = false;
  };
  consentPanel.querySelectorAll("[data-consent]").forEach((button) => button.addEventListener("click", () => setConsent(button.dataset.consent)));
  preferencesButton.addEventListener("click", () => {
    consentPanel.hidden = false;
    preferencesButton.hidden = true;
    consentPanel.querySelector("button")?.focus();
  });
  consentPanel.hidden = savedConsent !== "pending";
  preferencesButton.hidden = savedConsent === "pending";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    reveals.forEach((element) => element.classList.add("reveal-pending"));
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }), {threshold: 0.1, rootMargin: "0px 0px -5%"});
    reveals.forEach((element) => observer.observe(element));
  }
  document.querySelectorAll("a[href^='#']").forEach((link) => link.addEventListener("click", () => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) window.setTimeout(() => target.querySelector("input,select,button,a")?.focus({preventScroll: true}), 450);
  }));
  const faqItems = document.querySelectorAll(".faq details");
  faqItems.forEach((item) => item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((other) => { if (other !== item) other.open = false; });
  }));

  const tracked = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "gbraid", "wbraid"];
  const params = new URLSearchParams(window.location.search);
  tracked.forEach((key) => {
    const value = params.get(key);
    if (value) window.sessionStorage.setItem(key, value.slice(0, 500));
  });
  const phone = document.querySelector("#telefone");
  if (phone) phone.addEventListener("input", () => {
    const digits = phone.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) phone.value = digits;
    else if (digits.length <= 6) phone.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    else if (digits.length <= 10) phone.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    else phone.value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  });

  const thankYouEvent = document.body.dataset.thankYouEvent;
  if (thankYouEvent) window.dataLayer?.push({event: thankYouEvent, form_name: "move_brasil"});

  const form = document.querySelector("#lead-form");
  if (!form) return;
  const status = document.querySelector("#form-status");
  const submitButton = form.querySelector("button[type='submit']");
  const startedAt = form.querySelector("[name='form_started_at']");
  if (startedAt) startedAt.value = String(Date.now());
  const setStatus = (message, type = "") => {
    status.textContent = message;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  };
  const safePageUrl = () => `${window.location.origin}${window.location.pathname}`;
  const safeReferrer = () => {
    if (!document.referrer) return "";
    try { const url = new URL(document.referrer); return `${url.origin}${url.pathname}`; } catch { return ""; }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Confira os campos obrigatórios antes de continuar.", "error");
      return;
    }
    const data = new FormData(form);
    if (data.get("website")) return;
    if (Date.now() - Number(data.get("form_started_at") || 0) < 1500) {
      setStatus("Aguarde um instante e tente novamente.", "error");
      return;
    }
    const endpoint = form.dataset.endpoint?.trim();
    if (!endpoint) {
      setStatus("Integração indisponível. Fale com a equipe comercial.", "error");
      return;
    }
    const payload = Object.fromEntries(data.entries());
    delete payload.website;
    delete payload.form_started_at;
    payload.field_974fc67 = payload.email;
    payload.form_name = "move_brasil";
    tracked.forEach((key) => {
      const value = window.sessionStorage.getItem(key);
      if (value) payload[key] = value;
    });
    payload.page_url = safePageUrl();
    payload.referrer = safeReferrer();
    payload.sent_at = new Date().toISOString();
    submitButton.disabled = true;
    setStatus("Enviando seus dados…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Accept": "application/json"},
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("request_failed");
      setStatus("Contato enviado com sucesso!", "success");
      window.dataLayer?.push({event: "lead_form_success", form_name: "move_brasil", perfil: payload.perfil, modelo: payload.modelo});
      window.location.assign(form.dataset.success || "obrigado.html");
    } catch {
      setStatus("Não foi possível enviar agora. Tente novamente ou fale com o time comercial.", "error");
      submitButton.disabled = false;
    } finally {
      window.clearTimeout(timeout);
    }
  });
})();
