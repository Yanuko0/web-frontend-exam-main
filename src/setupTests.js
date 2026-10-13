import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// findBy*/waitFor default to 1s, which a busy machine can exceed with MUI + jsdom.
configure({ asyncUtilTimeout: 5000 });

// jsdom does not implement scrollIntoView.
window.HTMLElement.prototype.scrollIntoView = () => {};

// jsdom does not implement matchMedia (used for reduced-motion detection).
window.matchMedia = window.matchMedia || ((query) => ({
  matches: false,
  media: query,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
}));
