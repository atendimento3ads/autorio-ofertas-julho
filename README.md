# Chevrolet — Ofertas de Julho

Landing page de catálogo de ofertas (Chevrolet 0 km), publicada em dois domínios/marcas distintos, cada um com sua própria pasta pronta para deploy (upload do conteúdo da pasta direto na raiz do domínio).

## Estrutura

- `autorio/` → publicar em **https://chevroletautorio.com.br/**
  - GTM instalados: `GTM-PC23NR2` e `GTM-NDKTL3J` (duas unidades Autorio)
- `galileia/` → publicar em **https://galileiaconcessionaria.com.br/**
  - GTM instalados: `GTM-P22BFJC` e `GTM-NJH35M5` (duas unidades Galiléia)
  - **Pendente:** não há logo da Galiléia em `images-ofertas/`; o header/footer usam um wordmark de texto ("Galiléia") como placeholder. Envie o arquivo de logo para substituir.
- `images-ofertas/` (raiz) — imagens originais em PNG, mantidas como fonte/arquivo. As pastas `autorio/images-ofertas/` e `galileia/images-ofertas/` já contêm as versões otimizadas em JPEG (usadas nas páginas).

Cada pasta é autocontida (HTML + imagens), sem dependência entre si — pode ser enviada isoladamente para o respectivo servidor.

## O que foi feito

- **WhatsApp:** todos os CTAs (header, hero, 14 cards, faixa final e botão flutuante) apontam para o link de rastreio do Tintim. O botão flutuante usa o ícone/estilo fornecido (verde `#00AD57`).
- **GTM:** 2 containers por LP, instalados no `<head>` (script) + `<noscript>` logo após `<body>`, conforme padrão do Google. Sem página de obrigado (não há formulário na LP).
- **Favicon:** `favicon.svg` (bowtie dourado) aplicado como `rel="icon"` e `apple-touch-icon` nas duas LPs.
- **Rodapé:** "Desenvolvido por 3ADS" linkando para https://3ads.com.br/.
- **Animações:** fade-in + slide-up ao rolar a página (IntersectionObserver), com fallback para `prefers-reduced-motion`.
- **Performance:** imagens convertidas de PNG para JPEG otimizado (~15 MB → ~2 MB no total), preload da imagem do hero, preconnect para fontes/GTM, `width`/`height` explícitos para evitar CLS.
- **Responsivo:** CSS reescrito mobile-first, com breakpoints progressivos até telas widescreen/4K (grid de 1 a 5 colunas).
- **SEO/AEO/GEO:** meta description, canonical, Open Graph, Twitter Card, e dados estruturados JSON-LD (`AutoDealer` com ofertas + `FAQPage`) em cada LP.

## Pendências antes de publicar

1. Enviar a logo oficial da Galiléia (hoje é um wordmark de texto).
2. Confirmar se o link do Tintim deve ser o mesmo para as duas marcas ou se a Galiléia precisa de um link próprio.

Feito por 3ADS.
