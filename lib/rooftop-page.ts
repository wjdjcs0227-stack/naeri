import html from '../experience/index.html?raw';
import css from '../experience/style.css?raw';
import scene from '../experience/scene.js?raw';
import app from '../experience/app.js?raw';
import community from '../experience/community.js?raw';
import presence from '../experience/presence.js?raw';
import music from '../experience/music.js?raw';
export async function renderRooftop() {
 const page = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`)
  .replace('<script src="scene.js"></script>', `<script>${scene}</script>`)
  .replace('<script src="app.js"></script>', `<script>${app}</script>`)
  .replace('<script src="music.js"></script>', `<script>${music}</script>`)
  .replace('<script src="community.js"></script>', `<script>${community}</script>`)
  .replace('<script src="presence.js"></script>', `<script>${presence}</script>`);
 return new Response(page, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' } });
}
