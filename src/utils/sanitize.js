import DOMPurify from 'dompurify';

const ALLOWED_PROTOCOLS = /^(?:https?:|mailto:|tel:)/i;

// Links in job descriptions open in a new tab at most, never with access to
// the opener, and never to a script-like URL.
if (typeof window !== 'undefined') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      if (!ALLOWED_PROTOCOLS.test(node.getAttribute('href') || '')) {
        node.removeAttribute('href');
      }
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/** Sanitizes the HTML of a job description before it is rendered. */
export function sanitizeHtml(html) {
  return DOMPurify.sanitize(html || '', {
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
  });
}

/** True for absolute http(s) URLs; used to filter image URLs coming from the API. */
export function isSafeImageUrl(value) {
  try {
    const { protocol } = new URL(value);
    return protocol === 'https:' || protocol === 'http:';
  } catch (error) {
    return false;
  }
}
