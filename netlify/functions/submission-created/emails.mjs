// Branded email templates for meet and greet requests.
// Email clients ignore most modern CSS, so everything is table-based with inline styles
// and web-safe font fallbacks. Colors match the site: tomato, lime, ink, peach.

const C = {
  tomato: '#E8412C',
  lime: '#FFF8F4',
  ink: '#1A1412',
  peach: '#FFDCD6',
  paper: '#FFF8F4',
  muted: '#6A5550',
  white: '#FFFFFF',
};
const DISPLAY = "'Arial Rounded MT Bold','Arial Black',Helvetica,Arial,sans-serif";
const BODY = "Helvetica,Arial,sans-serif";
const MONO = "'Courier New',Courier,monospace";

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const digits = (s = '') => String(s).replace(/\D/g, '');
export function prettyPhone(s = '') {
  const d = digits(s).replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(s);
}

function shell({ preheader, title, body }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.peach};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.peach};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.peach};">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${C.white};border:3px solid ${C.ink};border-radius:20px;overflow:hidden;">
    <tr><td style="background:${C.tomato};padding:24px 26px 22px;border-bottom:3px solid ${C.ink};">
      <div style="font-family:${DISPLAY};font-size:30px;line-height:1.05;font-weight:900;color:${C.white};">Jenni <span style="display:inline-block;font-family:${BODY};font-style:italic;font-size:13px;font-weight:800;color:${C.ink};background:${C.lime};border:2px solid ${C.ink};border-radius:999px;padding:2px 9px 3px;vertical-align:middle;">with the</span> <span style="color:${C.lime};">Walks</span></div>
      <div style="font-family:${MONO};font-size:12px;font-weight:700;letter-spacing:2px;color:#4A0D06;margin-top:8px;">GERMANTOWN DOG WALKING</div>
    </td></tr>
    <tr><td style="padding:26px 26px 8px;font-family:${BODY};color:${C.ink};">${body}</td></tr>
    <tr><td style="padding:18px 26px 22px;background:${C.paper};border-top:3px solid ${C.ink};font-family:${BODY};font-size:13px;line-height:1.5;color:${C.muted};">
      Jenni with the Walks &middot; Germantown, Nashville<br>
      Venmo, Zelle, or cash &middot; <a href="https://www.instagram.com/hi_sedona/" style="color:${C.ink};font-weight:700;">@hi_sedona</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const label = (t) =>
  `<div style="font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.tomato};margin:0 0 8px;">${esc(t)}</div>`;

function timesBlock(times) {
  return times
    .filter(Boolean)
    .map(
      (t, i) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;"><tr>
      <td style="width:28px;height:28px;background:${C.ink};color:${C.lime};border-radius:14px;text-align:center;font-family:${MONO};font-size:13px;font-weight:700;">${i + 1}</td>
      <td style="padding-left:10px;font-family:${BODY};font-size:17px;font-weight:700;color:${C.ink};">${esc(t)}</td>
    </tr></table>`
    )
    .join('');
}

function button(href, text, bg = C.lime, fg = C.ink) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${bg};color:${fg};font-family:${BODY};font-size:15px;font-weight:800;text-decoration:none;border:3px solid ${C.ink};border-radius:999px;padding:11px 20px;margin:0 8px 10px 0;">${esc(text)}</a>`;
}

const row = (k, v) =>
  `<tr><td style="padding:8px 0;border-bottom:2px dotted #E5CBC4;font-family:${MONO};font-size:12px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:1px;width:90px;vertical-align:top;">${esc(k)}</td><td style="padding:8px 0 8px 10px;border-bottom:2px dotted #E5CBC4;font-family:${BODY};font-size:16px;color:${C.ink};">${v}</td></tr>`;

const quote = (msg) =>
  msg
    ? `<div style="margin:18px 0 6px;">${label('Their message')}<div style="background:${C.paper};border:2px solid ${C.ink};border-radius:14px;padding:14px 16px;font-family:${BODY};font-size:16px;line-height:1.5;color:${C.ink};">${esc(msg).replace(/\n/g, '<br>')}</div></div>`
    : '';

// Email to Jenni
export function ownerEmail(d) {
  const first = (d.name || '').split(/\s+/)[0] || 'them';
  const tel = digits(d.phone);
  const times = [d.option_1, d.option_2, d.option_3];
  const body = `
    ${label('New meet and greet request')}
    <div style="font-family:${DISPLAY};font-size:28px;line-height:1.1;font-weight:900;margin:0 0 18px;">${esc(d.name)}</div>
    ${label('Times that work for them')}
    ${timesBlock(times)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0 4px;">
      ${row('Phone', `<a href="tel:${tel}" style="color:${C.ink};font-weight:700;">${esc(prettyPhone(d.phone))}</a>`)}
      ${row('Email', `<a href="mailto:${esc(d.email)}" style="color:${C.ink};font-weight:700;">${esc(d.email)}</a>`)}
      ${d.interest ? row('Interested in', esc(d.interest)) : ''}
    </table>
    ${quote(d.message)}
    <div style="margin:22px 0 14px;">
      ${tel ? button(`sms:${tel}`, `Text ${first}`) : ''}
      ${button(`mailto:${d.email}?subject=${encodeURIComponent('Your meet and greet with Jenni')}`, `Email ${first}`, C.white)}
    </div>`;
  return {
    subject: `New meet & greet: ${d.name}`,
    html: shell({ preheader: `${d.name} picked 3 times. First choice: ${d.option_1 || ''}`, title: 'New meet and greet request', body }),
    text: [
      `New meet and greet request from ${d.name}`,
      '',
      'Times that work:',
      ...times.filter(Boolean).map((t, i) => `  ${i + 1}. ${t}`),
      '',
      `Phone: ${prettyPhone(d.phone)}`,
      `Email: ${d.email}`,
      d.interest ? `Interested in: ${d.interest}` : '',
      d.message ? `\nMessage:\n${d.message}` : '',
    ].filter((l) => l !== '').join('\n'),
  };
}

// Copy for the person who submitted
export function submitterEmail(d) {
  const first = (d.name || '').split(/\s+/)[0] || 'there';
  const times = [d.option_1, d.option_2, d.option_3];
  const body = `
    <div style="font-family:${DISPLAY};font-size:28px;line-height:1.1;font-weight:900;margin:0 0 10px;">Thanks, ${esc(first)}!</div>
    <p style="font-family:${BODY};font-size:17px;line-height:1.5;margin:0 0 20px;color:${C.ink};">Your meet and greet request is in. Jenni will confirm one of these times by text or email.</p>
    ${label('Your times')}
    ${timesBlock(times)}
    <div style="margin:20px 0 6px;background:${C.lime};border:3px solid ${C.ink};border-radius:16px;padding:16px 18px;">
      <div style="font-family:${BODY};font-size:16px;font-weight:800;margin:0 0 4px;color:${C.ink};">What happens at the meet and greet</div>
      <div style="font-family:${BODY};font-size:15px;line-height:1.5;color:${C.ink};">It's free and takes about 20 minutes at your place. Jenni meets your pup and learns the routine.</div>
    </div>
    ${quote(d.message).replace('Their message', 'Your note')}
    <p style="font-family:${BODY};font-size:15px;line-height:1.5;margin:20px 0 14px;color:${C.muted};">Need to change something? Just reply to this email.</p>`;
  return {
    subject: 'Got it! Your meet & greet request with Jenni',
    html: shell({ preheader: 'Jenni will confirm one of your times soon.', title: 'Your meet and greet request', body }),
    text: [
      `Thanks, ${first}!`,
      '',
      'Your meet and greet request is in. Jenni will confirm one of these times by text or email:',
      ...times.filter(Boolean).map((t, i) => `  ${i + 1}. ${t}`),
      '',
      'The meet and greet is free and takes about 20 minutes at your place.',
      'Need to change something? Just reply to this email.',
      '',
      'Jenni with the Walks · Germantown, Nashville',
    ].join('\n'),
  };
}
