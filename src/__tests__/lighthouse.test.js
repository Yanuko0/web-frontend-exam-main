/**
 * Lighthouse scores as a test. It is slow (it starts the production server and
 * a headless browser twice), so it only runs when LIGHTHOUSE=1:
 *
 *   yarn build
 *   LIGHTHOUSE=1 yarn test src/__tests__/lighthouse.test.js     (PowerShell: $env:LIGHTHOUSE=1)
 *
 * `yarn bench` runs the same measurement and prints a table.
 */
const { runLighthouse } = require('../../scripts/lighthouse');

const run = process.env.LIGHTHOUSE ? it : it.skip;

run('meets the Lighthouse thresholds on desktop and mobile', async () => {
  const { results, failures } = await runLighthouse();
  // eslint-disable-next-line no-console
  console.table(results);
  expect(failures).toEqual([]);
}, 600000);
