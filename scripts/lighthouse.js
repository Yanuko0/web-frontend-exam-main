/* eslint-disable no-console */
/**
 * Lighthouse benchmark against the production build.
 *
 *   yarn build && yarn bench
 *
 * Starts `next start`, runs Lighthouse for desktop and mobile, prints the scores
 * and metrics and exits with 1 when a threshold is missed. Needs Chrome (or
 * Edge); set CHROME_PATH when it is not in a standard location.
 */
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 3199;
const URL = `http://localhost:${PORT}/`;
const IS_WINDOWS = process.platform === 'win32';

// Scores are 0-100; metrics are in ms (CLS is unitless).
const THRESHOLDS = {
  desktop: {
    performance: 90, accessibility: 95, 'best-practices': 95, seo: 95, tbt: 300, cls: 0.1, lcp: 2500,
  },
  mobile: {
    performance: 85, accessibility: 95, 'best-practices': 95, seo: 95, tbt: 600, cls: 0.1, lcp: 4000,
  },
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function waitForServer(timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http.get(URL, (res) => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() > deadline) reject(new Error('The server did not start in time'));
        else setTimeout(attempt, 500);
      });
    };
    attempt();
  });
}

function lighthouse(preset, chrome) {
  const output = path.join(os.tmpdir(), `lighthouse-${preset}-${Date.now()}.json`);
  const args = [
    '--yes', 'lighthouse@12', URL,
    '--quiet',
    '--only-categories=performance,accessibility,best-practices,seo',
    '--output=json', `--output-path=${output}`,
    '--chrome-flags=--headless=new --no-sandbox',
  ];
  if (preset === 'desktop') args.push('--preset=desktop');
  execFileSync(IS_WINDOWS ? 'npx.cmd' : 'npx', args, {
    stdio: 'ignore', env: { ...process.env, CHROME_PATH: chrome }, shell: IS_WINDOWS,
  });
  const report = JSON.parse(fs.readFileSync(output, 'utf8'));
  fs.rmSync(output, { force: true });
  const score = (id) => Math.round(report.categories[id].score * 100);
  const metric = (id) => report.audits[id].numericValue;
  return {
    preset,
    performance: score('performance'),
    accessibility: score('accessibility'),
    'best-practices': score('best-practices'),
    seo: score('seo'),
    fcp: Math.round(metric('first-contentful-paint')),
    lcp: Math.round(metric('largest-contentful-paint')),
    tbt: Math.round(metric('total-blocking-time')),
    cls: Number(metric('cumulative-layout-shift').toFixed(3)),
    speedIndex: Math.round(metric('speed-index')),
    bytes: Math.round(metric('total-byte-weight') / 1024),
  };
}

/** Returns `{ results, failures }`; a failure is a human readable string. */
async function runLighthouse() {
  if (!fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) {
    throw new Error('No production build found. Run `yarn build` first.');
  }
  const chrome = findChrome();
  if (!chrome) throw new Error('Chrome or Edge not found. Set CHROME_PATH.');

  const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  const server = spawn(process.execPath, [nextBin, 'start', '-p', String(PORT)], {
    cwd: ROOT, stdio: 'ignore',
  });
  try {
    await waitForServer();
    const results = ['desktop', 'mobile'].map((preset) => lighthouse(preset, chrome));
    const failures = [];
    results.forEach((result) => {
      const limits = THRESHOLDS[result.preset];
      ['performance', 'accessibility', 'best-practices', 'seo'].forEach((category) => {
        if (result[category] < limits[category]) {
          failures.push(`${result.preset} ${category}: ${result[category]} < ${limits[category]}`);
        }
      });
      ['tbt', 'lcp', 'cls'].forEach((name) => {
        if (result[name] > limits[name]) {
          failures.push(`${result.preset} ${name}: ${result[name]} > ${limits[name]}`);
        }
      });
    });
    return { results, failures };
  } finally {
    server.kill();
  }
}

module.exports = { runLighthouse, THRESHOLDS };

if (require.main === module) {
  runLighthouse().then(({ results, failures }) => {
    console.table(results);
    if (failures.length) {
      console.error(`\nBelow threshold:\n - ${failures.join('\n - ')}`);
      process.exit(1);
    }
    console.log('\nAll Lighthouse thresholds met.');
  }).catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
