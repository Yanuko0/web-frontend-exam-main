// The one inline script of the page: it switches the (print-media) font stylesheet on.
// It is a plain CommonJS module so next.config.js can hash it for the
// Content-Security-Policy and _document.js can render the very same string.
//
// It does not rely on a single signal: the stylesheet's `load` (or `error`) event,
// an already existing `sheet`, or the window `load` event as a last resort - so
// the font is never left stuck on media="print".
module.exports = '(function(){var l=document.getElementById(\'font-css\');if(!l)return;var d=false;function a(){if(d)return;d=true;l.media=\'all\'}if(l.sheet){a()}else{l.addEventListener(\'load\',a);l.addEventListener(\'error\',a);window.addEventListener(\'load\',a)}})();';
