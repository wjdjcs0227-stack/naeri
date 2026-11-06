import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist-vercel', { recursive: true });
for (const file of ['index.html', 'style.css', 'scene.js', 'app.js', 'community.js', 'presence.js']) {
  await copyFile(`experience/${file}`, `dist-vercel/${file}`);
}
console.log('Vercel frontend ready. Chat uses the existing moderated Sites service.');
