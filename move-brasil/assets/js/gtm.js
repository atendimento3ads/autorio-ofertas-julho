(() => {
  "use strict";

  const consentKey = "autorio_tracking_consent_v1";
  const containerIds = ["GTM-NDKTL3J", "GTM-PC23NR2"];
  const clarityProjectId = "yn2vutsi16";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };

  let savedConsent = "pending";
  try { savedConsent = window.localStorage.getItem(consentKey) || "pending"; } catch {}
  const granted = savedConsent === "accepted";

  window.gtag("consent", "default", {
    ad_storage: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });
  window.clarity("consentv2", {
    ad_Storage: granted ? "granted" : "denied",
    analytics_Storage: granted ? "granted" : "denied"
  });

  window.autorioUpdateConsent = (accepted) => {
    window.gtag("consent", "update", {
      ad_storage: accepted ? "granted" : "denied",
      analytics_storage: accepted ? "granted" : "denied",
      ad_user_data: accepted ? "granted" : "denied",
      ad_personalization: accepted ? "granted" : "denied"
    });
    window.clarity("consentv2", {
      ad_Storage: accepted ? "granted" : "denied",
      analytics_Storage: accepted ? "granted" : "denied"
    });
    window.dataLayer.push({event: "privacy_consent_update", consent_status: accepted ? "accepted" : "rejected"});
  };

  let trackingContainersLoaded = false;
  const loadGtmContainers = () => {
    if (trackingContainersLoaded) return;
    trackingContainersLoaded = true;
    containerIds.forEach((containerId) => {
      window.dataLayer.push({"gtm.start": Date.now(), event: "gtm.js", container_id: containerId});
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
      document.head.appendChild(script);
    });
  };

  const clarityScript = document.createElement("script");
  clarityScript.async = true;
  clarityScript.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
  clarityScript.addEventListener("load", loadGtmContainers, {once: true});
  clarityScript.addEventListener("error", loadGtmContainers, {once: true});
  document.head.appendChild(clarityScript);
})();
