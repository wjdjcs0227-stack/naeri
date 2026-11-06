import { mkdir, copyFile, readFile, writeFile, cp } from 'node:fs/promises';
import { seoArtifacts } from './seo.mjs';
await mkdir('dist-vercel', { recursive: true });
for (const file of ['style.css', 'scene.js', 'app.js', 'community.js', 'presence.js', 'music.js']) {
  await copyFile(`experience/${file}`, `dist-vercel/${file}`);
}
await cp('public/audio', 'dist-vercel/audio', { recursive: true });
const seo = seoArtifacts(await readFile('experience/index.html', 'utf8'));
await Promise.all([
  writeFile('dist-vercel/index.html', seo.html),
  writeFile('dist-vercel/robots.txt', seo.robots),
  writeFile('dist-vercel/sitemap.xml', seo.sitemap),
]);
console.log('Vercel frontend and SEO files ready. Chat uses the existing moderated Sites service.');
