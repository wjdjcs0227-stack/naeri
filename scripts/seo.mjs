import { site } from '../config/site.mjs';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function seoArtifacts(html, env = process.env) {
  const url = new URL(env.SITE_URL || site.url);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL must be an HTTPS origin without credentials, paths, query or hash.');
  const canonical = url.href;
  const tags = [
    `<title>${escape(site.title)}</title>`,
    `<meta name="description" content="${escape(site.description)}">`,
    '<meta name="robots" content="index, follow">',
    `<link rel="canonical" href="${escape(canonical)}">`,
    '<meta property="og:type" content="website">',
    '<meta property="og:locale" content="ko_KR">',
    `<meta property="og:site_name" content="${escape(site.name)}">`,
    `<meta property="og:title" content="${escape(site.title)}">`,
    `<meta property="og:description" content="${escape(site.description)}">`,
    `<meta property="og:url" content="${escape(canonical)}">`,
  ];
  for (const [name, token] of [
    ['google-site-verification', env.GOOGLE_SITE_VERIFICATION || site.verification.google],
    ['naver-site-verification', env.NAVER_SITE_VERIFICATION || site.verification.naver],
  ]) if (token.trim()) tags.push(`<meta name="${name}" content="${escape(token.trim())}">`);
  // Replace only head metadata; preserve every rendered control and script.
  const result = html.replace(/<head>([\s\S]*?)<\/head>/i, (_, head) => '<head>' + head
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b[^>]*name=["']description["'][^>]*>/gi, '') + '\n' + tags.join('\n') + '\n</head>');
  return {
    html: result,
    robots: `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${canonical}sitemap.xml\n`,
    sitemap: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${escape(canonical)}</loc></url>\n</urlset>\n`,
  };
}
