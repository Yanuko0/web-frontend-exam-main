/**
 * Static security checks. They read the source tree (and the production build
 * when it exists) so that regressions fail `yarn test`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'src');

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) return entry.name === 'figma' ? [] : walk(full);
  return full.endsWith('.js') ? [full] : [];
});

const rel = (file) => path.relative(ROOT, file).replace(/\\/g, '/');
const isTest = (file) => /\.test\.js$/.test(file) || file.includes(`${path.sep}__tests__${path.sep}`);
const read = (file) => fs.readFileSync(file, 'utf8');
const appFiles = walk(SRC).filter((file) => !isTest(file));
const clientFiles = appFiles.filter((file) => {
  const name = rel(file);
  return !name.startsWith('src/server/') && !name.startsWith('src/pages/api/');
});

/**
 * Module specifiers that point into the server folder, whatever the syntax:
 * import ... from '...', export ... from '...', import('...'), require('...').
 */
const serverImports = (source) => {
  const specifier = /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)['"]([^'"]+)['"]/g;
  return [...source.matchAll(specifier)]
    .map((match) => match[1])
    .filter((target) => /(^|\/)server(\/|$)/.test(target));
};

describe('data stays on the server', () => {
  it('detects every way of importing the server folder', () => {
    const samples = [
      "import jobs from '../server/jobs';",
      "export { default } from '../server/jobs';",
      "const data = await import('../server/jobs');",
      "const data = require('../server/jobs');",
      "import '../server/data/jobList';",
    ];
    samples.forEach((sample) => expect(serverImports(sample)).toHaveLength(1));
    expect(serverImports("import api from '../api';")).toEqual([]);
  });

  it('client code never imports the server folder (the data would be bundled)', () => {
    const offenders = clientFiles.filter((file) => serverImports(read(file)).length > 0);
    expect(offenders.map(rel)).toEqual([]);
  });

  it('every API route goes through the GET-only, rate-limited handler', () => {
    const routes = appFiles.filter((file) => rel(file).startsWith('src/pages/api/'));
    expect(routes.length).toBeGreaterThanOrEqual(4);
    routes.forEach((file) => {
      expect(read(file)).toMatch(/getOnly\(/);
    });
  });

  const built = fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID')) ? it : it.skip;
  built('the production client bundle contains none of the job data', () => {
    const chunks = path.join(ROOT, '.next', 'static', 'chunks');
    const marker = '招募經驗豐富的前端工程師';
    const leaked = walk(chunks).filter((file) => read(file).includes(marker));
    expect(leaked).toEqual([]);
  });
});

describe('security headers', () => {
  // Loads next.config.js as if NODE_ENV were `env`, and always restores the original value
  // (including "not set") even when loading throws.
  const loadConfig = (env) => {
    const hadValue = Object.prototype.hasOwnProperty.call(process.env, 'NODE_ENV');
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = env;
    try {
      jest.resetModules();
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path.join(ROOT, 'next.config.js'));
    } finally {
      if (hadValue) process.env.NODE_ENV = previous;
      else delete process.env.NODE_ENV;
    }
  };
  const headersOf = async (config) => {
    const [{ headers }] = await config.headers();
    return Object.fromEntries(headers.map(({ key, value }) => [key, value]));
  };
  const directive = (csp, name) => csp.split('; ').find((part) => part.startsWith(`${name} `)) || '';

  it('sets the standard protective headers on every route', async () => {
    const headers = await headersOf(loadConfig('production'));
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBeDefined();
    expect(headers['Permissions-Policy']).toMatch(/camera=\(\)/);
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
  });

  it('ships a strict Content-Security-Policy in production', async () => {
    const csp = (await headersOf(loadConfig('production')))['Content-Security-Policy'];
    expect(csp).toMatch(/default-src 'self'/);
    expect(csp).toMatch(/frame-ancestors 'none'/);
    expect(csp).toMatch(/object-src 'none'/);
    expect(csp).toMatch(/base-uri 'self'/);
    expect(csp).not.toMatch(/unsafe-eval/);
  });

  it('allows scripts only from this site and the hash of the one inline script', async () => {
    const csp = (await headersOf(loadConfig('production')))['Content-Security-Policy'];
    const scripts = directive(csp, 'script-src');
    expect(scripts).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
    expect(scripts).toMatch(/'sha256-[A-Za-z0-9+/]+=*'/);
  });

  it('keeps the browser talking only to this site (data goes through our own API)', async () => {
    const csp = (await headersOf(loadConfig('production')))['Content-Security-Policy'];
    expect(directive(csp, 'connect-src')).toBe("connect-src 'self'");
  });

  it('relaxes the policy only for the dev server (hot reload)', async () => {
    const dev = (await headersOf(loadConfig('development')))['Content-Security-Policy'];
    expect(dev).toMatch(/unsafe-eval/);
    // Any other environment (staging, test...) stays strict.
    const staging = (await headersOf(loadConfig('staging')))['Content-Security-Policy'];
    expect(staging).not.toMatch(/unsafe-eval|ws:/);
    expect(directive(staging, 'script-src')).not.toMatch(/unsafe-inline/);
  });

  it('sends HSTS only outside development, without subdomains or preload', async () => {
    const production = (await headersOf(loadConfig('production')))['Strict-Transport-Security'];
    expect(production).toMatch(/^max-age=\d+$/);
    expect((await headersOf(loadConfig('development')))['Strict-Transport-Security']).toBeUndefined();
  });

  it('does not leave NODE_ENV changed after loading the config', () => {
    const before = process.env.NODE_ENV;
    loadConfig('production');
    expect(process.env.NODE_ENV).toBe(before);
  });

  it('does not advertise the framework', () => {
    expect(loadConfig('production').poweredByHeader).toBe(false);
  });
});

describe('code hygiene', () => {
  it('renders raw HTML only through the sanitizer (plus one constant script)', () => {
    const users = appFiles
      .filter((file) => read(file).includes('dangerouslySetInnerHTML'))
      .map(rel);
    // The job description goes through the sanitizer; _document only injects a constant
    // string (the font loader), never data.
    expect(users).toEqual(['src/components/JobDialog.js', 'src/pages/_document.js']);
    expect(read(path.join(ROOT, 'src/components/JobDialog.js'))).toMatch(/sanitizeHtml\(/);
    expect(read(path.join(ROOT, 'src/pages/_document.js'))).toMatch(/__html: fontLoaderScript/);
  });

  it('never uses eval or the Function constructor', () => {
    const offenders = appFiles.filter((file) => /\beval\(|new Function\(/.test(read(file)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('has no hard-coded secrets', () => {
    const pattern = /(api[_-]?key|secret|token|passw(or)?d)\s*[:=]\s*['"][^'"]{8,}['"]/i;
    const offenders = appFiles.filter((file) => pattern.test(read(file)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('keeps env files and build output out of version control', () => {
    const ignore = read(path.join(ROOT, '.gitignore'));
    expect(ignore).toMatch(/^\.env$/m);
    expect(ignore).toMatch(/\/\.next\//);
    expect(fs.existsSync(path.join(ROOT, '.env'))).toBe(false);
  });

  it('opens external images without leaking the referrer', () => {
    ['src/components/CarouselImage.js', 'src/components/ImagePreview.js'].forEach((name) => {
      expect(read(path.join(ROOT, name))).toMatch(/referrerPolicy="no-referrer"/);
    });
  });
});

describe('font loader script', () => {
  // eslint-disable-next-line global-require
  const script = require('../fontLoaderScript');

  const run = (link) => {
    document.body.innerHTML = '';
    if (link) document.body.appendChild(link);
    // eslint-disable-next-line no-new-func
    new Function(script)();
  };
  const makeLink = (sheet) => {
    const link = document.createElement('link');
    link.id = 'font-css';
    link.media = 'print';
    Object.defineProperty(link, 'sheet', { value: sheet, configurable: true });
    return link;
  };

  it('switches the stylesheet on right away when it is already loaded', () => {
    const link = makeLink({});
    run(link);
    expect(link.media).toBe('all');
  });

  it('switches it on when the stylesheet finishes loading', () => {
    const link = makeLink(null);
    run(link);
    expect(link.media).toBe('print');
    link.dispatchEvent(new Event('load'));
    expect(link.media).toBe('all');
  });

  it('never leaves the font stuck: an error or the window load also switches it on', () => {
    const failed = makeLink(null);
    run(failed);
    failed.dispatchEvent(new Event('error'));
    expect(failed.media).toBe('all');

    const missedEvent = makeLink(null);
    run(missedEvent);
    window.dispatchEvent(new Event('load'));
    expect(missedEvent.media).toBe('all');
  });

  it('does nothing when the link is missing', () => {
    expect(() => run(null)).not.toThrow();
  });
});
