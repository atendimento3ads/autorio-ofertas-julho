(() => {
  "use strict";

  const siteStylesheet = document.querySelector("#site-css");
  if (siteStylesheet) siteStylesheet.media = "all";

  const consentKey = "autorio_tracking_consent_v1";
  const isNestedLandingPage = window.location.pathname.includes("/move-brasil/") || window.location.pathname.includes("/ofertas/");
  const legalPrefix = isNestedLandingPage ? "../" : "";
  let savedConsent = "pending";
  try { savedConsent = window.localStorage.getItem(consentKey) || "pending"; } catch {}

  const consentPanel = document.createElement("section");
  consentPanel.className = "consent-panel";
  consentPanel.setAttribute("aria-label", "Preferências de privacidade");
  consentPanel.setAttribute("aria-live", "polite");
  consentPanel.innerHTML = `<div><strong>Privacidade e medição</strong><p>Usamos cookies opcionais para medir campanhas e melhorar a experiência. Você pode aceitar ou recusar. Os cookies necessários continuam ativos.</p><p><a href="${legalPrefix}politica-de-privacidade.html">Política de Privacidade</a> · <a href="${legalPrefix}termos-de-uso.html">Termos de Uso</a></p></div><div class="consent-panel__actions"><button type="button" data-consent="rejected">Recusar opcionais</button><button type="button" class="is-primary" data-consent="accepted">Aceitar opcionais</button></div>`;
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
  const videoFrame = document.querySelector(".hero__video iframe[data-src]");
  if (videoFrame && !reducedMotion) {
    const loadVideo = () => {
      videoFrame.addEventListener("load", () => videoFrame.parentElement?.classList.add("is-ready"), {once: true});
      videoFrame.src = videoFrame.dataset.src;
      videoFrame.removeAttribute("data-src");
    };
    window.addEventListener("load", () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(loadVideo, {timeout: 1200});
      else window.setTimeout(loadVideo, 350);
    }, {once: true});
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (!reducedMotion && "IntersectionObserver" in window) {
    revealItems.forEach((item) => item.classList.add("reveal-pending"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.12, rootMargin: "0px 0px -6%"});
    revealItems.forEach((item) => observer.observe(item));
  }

  const faqItems = document.querySelectorAll(".faq details");
  faqItems.forEach((item) => item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach((otherItem) => { if (otherItem !== item) otherItem.open = false; });
  }));

  const trackedParameters = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "gbraid", "wbraid"];
  const currentParameters = new URLSearchParams(window.location.search);
  trackedParameters.forEach((key) => {
    const value = currentParameters.get(key);
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
  if (thankYouEvent) window.dataLayer?.push({event: thankYouEvent});

  const form = document.querySelector("#lead-form");
  if (!form) return;
  const status = document.querySelector("#form-status");
  const submitButton = form.querySelector("button[type='submit']");
  const startedAt = form.querySelector("[name='form_started_at']");
  if (startedAt) startedAt.value = String(Date.now());
  const showStatus = (message, type = "") => {
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
    showStatus("");
    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus("Confira os campos obrigatórios antes de continuar.", "error");
      return;
    }
    const rawData = new FormData(form);
    if (rawData.get("website")) return;
    const formAge = Date.now() - Number(rawData.get("form_started_at") || 0);
    if (formAge < 1500) {
      showStatus("Aguarde um instante e tente novamente.", "error");
      return;
    }
    const endpoint = form.dataset.endpoint?.trim();
    if (!endpoint) {
      showStatus("Integração indisponível. Fale com nossa equipe por telefone.", "error");
      return;
    }
    const payload = Object.fromEntries(rawData.entries());
    delete payload.website;
    delete payload.form_started_at;
    trackedParameters.forEach((key) => {
      const value = window.sessionStorage.getItem(key);
      if (value) payload[key] = value;
    });
    payload.form_name = "cotacao_autorio";
    payload.page_url = safePageUrl();
    payload.referrer = safeReferrer();
    payload.sent_at = new Date().toISOString();
    submitButton.disabled = true;
    showStatus("Enviando seus dados…");
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
      showStatus("Contato enviado com sucesso!", "success");
      window.dataLayer?.push({event: "lead_form_success", form_name: "cotacao_autorio", service: payload.servico});
      window.location.assign(form.dataset.success || "obrigado.html");
    } catch {
      showStatus("Não foi possível enviar agora. Tente novamente ou fale com um especialista.", "error");
      submitButton.disabled = false;
    } finally {
      window.clearTimeout(timeout);
    }
  });
})();
