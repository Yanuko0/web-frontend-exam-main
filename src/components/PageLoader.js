import React from 'react';
import { useI18n } from '../i18n';
import { HERO_HEIGHT } from './heroSources';

/**
 * First-paint placeholder while the page code loads: three bouncing dots over
 * the hero background that the page already shows. Plain markup + styled-jsx
 * (no MUI) so it is fully styled in the server HTML.
 */
export default function PageLoader() {
  const { t } = useI18n();
  return (
    <div className="page-loader">
      <div className="dots" role="status" aria-label={t('page.loading')}>
        <span />
        <span />
        <span />
      </div>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>
        {`
          .page-loader {
            position: relative;
            min-height: 100vh;
            background: #f0f0f0;
          }
          .dots {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            height: ${HERO_HEIGHT.xs};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          @media (min-width: 900px) {
            .dots {
              height: ${HERO_HEIGHT.md};
            }
          }
          .dots span {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ee8d2b;
            animation: bounce 1s ease-in-out infinite;
          }
          .dots span:nth-child(2) {
            background: #d95b48;
            animation-delay: 0.15s;
          }
          .dots span:nth-child(3) {
            animation-delay: 0.3s;
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0) scale(0.7); opacity: 0.45; }
            40% { transform: translateY(-10px) scale(1); opacity: 1; }
          }
          @media (prefers-reduced-motion: reduce) {
            .dots span { animation: none; opacity: 0.8; }
          }
        `}
      </style>
    </div>
  );
}
