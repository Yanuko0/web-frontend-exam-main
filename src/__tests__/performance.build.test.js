/**
 * Build-output checks (bundle budgets and "what is in the HTML"). They run
 * against `.next` and are skipped when the project has not been built, so run
 * `yarn build` before `yarn test` to include them.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '../..');
const NEXT = path.join(ROOT, '.next');
// With i18n routing the default-locale page is prerendered as zh-TW.html.
const HOME_HTML = path.join(NEXT, 'server', 'pages', 'zh-TW.html');
const built = fs.existsSync(path.join(NEXT, 'BUILD_ID')) ? describe : describe.skip;

const KB = 1024;
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(NEXT, name), 'utf8'));
const gzipBytes = (file) => zlib.gzipSync(fs.readFileSync(path.join(NEXT, file))).length;
const gzipKb = (files) => [...files].reduce((sum, file) => sum + gzipBytes(file), 0) / KB;
const walk = (dir) => (fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  })
  : []);

/** Files for dynamic imports whose importing module matches `importer`. */
const dynamicFiles = (importer) => Object.entries(readJson('react-loadable-manifest.json'))
  .filter(([key]) => importer.test(key))
  .flatMap(([, entry]) => entry.files)
  .filter((file) => file.endsWith('.js'));

built('production build budgets', () => {
  it('keeps the JavaScript needed for the first screen under 230KB gzipped', () => {
    const manifest = readJson('build-manifest.json');
    // What the browser really downloads for "/": the shared runtime, the page, the
    // polyfills, and the client-only App chunk the page loads dynamically. The job
    // dialog is loaded on demand and is budgeted separately below.
    const files = new Set([
      ...manifest.polyfillFiles,
      ...manifest.pages['/_app'],
      ...manifest.pages['/'],
      ...dynamicFiles(/pages[\\/]index\.js -> \.\.\/App$/),
    ]);
    expect(files.size).toBeGreaterThan(5);
    expect(gzipKb(files)).toBeLessThan(230);
  });

  it('keeps the on-demand job dialog chunks under 50KB gzipped', () => {
    const files = dynamicFiles(/App\.js -> \.\/components\/JobDialog$/);
    expect(files.length).toBeGreaterThan(0);
    expect(gzipKb(files)).toBeLessThan(50);
  });

  it('keeps every picture small enough', () => {
    const media = walk(path.join(NEXT, 'static', 'media'));
    const over = media
      .filter((file) => fs.statSync(file).size > 300 * KB)
      .map((file) => path.basename(file));
    expect(over).toEqual([]);
  });

  it('loads the web font without blocking the first paint', () => {
    const html = fs.readFileSync(HOME_HTML, 'utf8');
    const outsideNoscript = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');
    const fontLinks = outsideNoscript.match(/<link[^>]+fonts\.googleapis\.com\/css2[^>]*>/g) || [];

    // The stylesheet is a print-media link that a tiny script switches on after loading.
    expect(fontLinks).toHaveLength(1);
    expect(fontLinks[0]).toMatch(/media="print"/);
    expect(fontLinks[0]).toMatch(/display=swap/);
    expect(html).toMatch(/rel="preconnect"[^>]+href="https:\/\/fonts\.googleapis\.com"/);
    expect(html).toMatch(/rel="preconnect"[^>]+href="https:\/\/fonts\.gstatic\.com"/);
  });

  it('puts the hero picture in the HTML and preloads it (fast largest paint)', () => {
    const html = fs.readFileSync(HOME_HTML, 'utf8');
    expect(html).toMatch(/<link[^>]+rel="preload"[^>]+as="image"[^>]+hero-bg/);
    expect(html).toMatch(/<img[^>]+srcSet="[^"]*hero-bg[^>]*hero-background/);
    expect(html).toMatch(/\.hero-background\.jsx-\d+\{[^}]*object-fit:cover/);
  });

  it('declares the document language and a responsive viewport', () => {
    const html = fs.readFileSync(HOME_HTML, 'utf8');
    expect(html).toMatch(/<html[^>]+lang="zh-TW"/);
    expect(html).toMatch(/name="viewport"/);
  });

  it('serves a CSP whose script hash matches the inline font script', () => {
    // The inline script in the HTML must be exactly the one the policy allows.
    const html = fs.readFileSync(HOME_HTML, 'utf8');
    // eslint-disable-next-line global-require
    const script = require('../fontLoaderScript');
    expect(html).toContain(`<script>${script}</script>`);
  });
});
