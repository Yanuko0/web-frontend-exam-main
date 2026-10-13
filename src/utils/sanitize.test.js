import { isSafeImageUrl, sanitizeHtml } from './sanitize';

const scriptUrl = ['java', 'script:alert(1)'].join('');

describe('sanitizeHtml', () => {
  it('removes scripts, event handlers and inline styles', () => {
    const html = sanitizeHtml('<p onclick="x()" style="color:red">hi<script>alert(1)</script><img src=x onerror=alert(1)></p>');
    expect(html).toContain('hi');
    expect(html).not.toMatch(/script|onclick|onerror|style=/i);
  });

  it('drops dangerous link targets and hardens the rest', () => {
    const bad = sanitizeHtml(`<a href="${scriptUrl}">x</a>`);
    expect(bad).not.toMatch(/javascript:/i);

    const good = document.createElement('div');
    good.innerHTML = sanitizeHtml('<a href="mailto:hr@example.com" target="_blank">mail</a>');
    const link = good.querySelector('a');
    expect(link.getAttribute('href')).toBe('mailto:hr@example.com');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('removes forms, frames and embeds', () => {
    const html = sanitizeHtml('<form action="/x"><input name="a"></form><iframe src="https://evil.test"></iframe><object data="x"></object>');
    expect(html).not.toMatch(/<form|<input|<iframe|<object/i);
  });

  it('keeps the formatting job descriptions rely on', () => {
    const html = sanitizeHtml('<h2>資格</h2><ul><li>高中<br />畢業</li></ul>');
    expect(html).toContain('<h2>資格</h2>');
    expect(html).toContain('<li>');
  });

  it('handles missing input', () => {
    expect(sanitizeHtml(undefined)).toBe('');
  });
});

describe('isSafeImageUrl', () => {
  it('accepts only absolute http(s) URLs', () => {
    expect(isSafeImageUrl('https://picsum.photos/250/150')).toBe(true);
    expect(isSafeImageUrl('http://example.com/a.png')).toBe(true);
    expect(isSafeImageUrl(scriptUrl)).toBe(false);
    expect(isSafeImageUrl('data:image/svg+xml;base64,AAAA')).toBe(false);
    expect(isSafeImageUrl('/relative.png')).toBe(false);
    expect(isSafeImageUrl(undefined)).toBe(false);
  });
});
