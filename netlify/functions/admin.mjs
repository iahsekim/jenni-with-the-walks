// Admin API for the /admin dashboard. Every call needs the header
// `x-admin-key` matching the ADMIN_PASSWORD environment variable.
//   GET  /api/admin?action=leads             -> all leads, newest first
//   GET  /api/admin?action=stats&days=7      -> Cloudflare Web Analytics summary
//   POST /api/admin {action:'update', id, status?, meeting?, note?}
//   POST /api/admin {action:'add', name, phone, email, message}
//   POST /api/admin {action:'delete', id}
import { timingSafeEqual } from 'node:crypto';
import { STATUSES, getLead, saveLead, listLeads, leadFromForm, deleteLead } from '../lib/leads.mjs';

export const config = { path: '/api/admin' };

// Cloudflare identifiers for jenniwiththewalks.com (not secret).
const CF_ACCOUNT = '2c25cefe2444871d0a3aabd71823b5c7';
const CF_SITE_TAG = '852efd6c261347ef85b81bd364a3fec4';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

function authorized(req) {
  const want = process.env.ADMIN_PASSWORD || '';
  const got = req.headers.get('x-admin-key') || '';
  if (!want) return false;
  const a = Buffer.from(want), b = Buffer.from(got);
  return a.length === b.length && timingSafeEqual(a, b);
}

const clip = (s, n) => String(s ?? '').trim().slice(0, n);

async function stats(days) {
  const token = process.env.CF_API_TOKEN;
  if (!token) return { error: 'CF_API_TOKEN is not set in Netlify.' };
  const end = new Date();
  const start = new Date(end.getTime() - days * 864e5);
  const query = `query($a:String!,$f:AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject){viewer{accounts(filter:{accountTag:$a}){
    total:rumPageloadEventsAdaptiveGroups(filter:$f,limit:1){sum{visits}}
    series:rumPageloadEventsAdaptiveGroups(filter:$f,limit:1000,orderBy:[date_ASC]){sum{visits} dimensions{date}}
    sources:rumPageloadEventsAdaptiveGroups(filter:$f,limit:8,orderBy:[sum_visits_DESC]){sum{visits} dimensions{refererHost}}
  }}}`;
  const filter = { AND: [{ datetime_geq: start.toISOString(), datetime_leq: end.toISOString() }, { siteTag: CF_SITE_TAG }] };
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables: { a: CF_ACCOUNT, f: filter } }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok || body.errors?.length) {
    console.error('Cloudflare analytics error', r.status, JSON.stringify(body.errors || body));
    return { error: body.errors?.[0]?.message || `Cloudflare returned ${r.status}` };
  }
  const acc = body.data?.viewer?.accounts?.[0] || {};
  const t = acc.total?.[0];

  // Fill in every day of the range so the chart has no gaps.
  const byDay = Object.fromEntries((acc.series || []).map((s) => [s.dimensions.date, s]));
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 864e5).toISOString().slice(0, 10);
    series.push({ date: d, visits: byDay[d]?.sum?.visits || 0 });
  }
  return {
    days,
    visits: t?.sum?.visits || 0,
    series,
    sources: (acc.sources || []).map((s) => ({ name: s.dimensions.refererHost || 'Direct or app', value: s.sum.visits })),
  };
}

export default async (req) => {
  if (!authorized(req)) return json({ error: 'Wrong password' }, 401);
  const url = new URL(req.url);

  try {
    if (req.method === 'GET') {
      const action = url.searchParams.get('action');
      if (action === 'leads') return json({ leads: await listLeads() });
      if (action === 'stats') {
        const days = [1, 7, 30].includes(+url.searchParams.get('days')) ? +url.searchParams.get('days') : 7;
        return json(await stats(days));
      }
      return json({ ok: true });
    }

    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const body = await req.json().catch(() => ({}));

    if (body.action === 'add') {
      if (!clip(body.name, 120)) return json({ error: 'Add a name.' }, 400);
      const lead = leadFromForm(
        { name: clip(body.name, 120), phone: clip(body.phone, 40), email: clip(body.email, 200), message: clip(body.message, 4000) },
        { source: 'manual' }
      );
      return json({ lead: await saveLead(lead) });
    }

    const lead = body.id ? await getLead(String(body.id)) : null;
    if (!lead) return json({ error: 'Lead not found' }, 404);

    if (body.action === 'delete') {
      await deleteLead(lead.id);
      return json({ ok: true });
    }

    if (body.action === 'update') {
      if (body.status !== undefined) {
        if (!STATUSES.includes(body.status)) return json({ error: 'Unknown status' }, 400);
        if (body.status !== lead.status) {
          lead.notes.push({ at: new Date().toISOString(), text: `Marked ${body.status[0].toUpperCase()}${body.status.slice(1)}`, system: true });
          lead.status = body.status;
        }
      }
      if (body.meeting !== undefined) lead.meeting = clip(body.meeting, 40);
      for (const k of ['name', 'phone', 'email']) if (body[k] !== undefined) lead[k] = clip(body[k], k === 'email' ? 200 : 120);
      const note = clip(body.note, 4000);
      if (note) lead.notes.push({ at: new Date().toISOString(), text: note });
      lead.updatedAt = new Date().toISOString();
      return json({ lead: await saveLead(lead) });
    }

    return json({ error: 'Unknown action' }, 400);
  } catch (err) {
    console.error('Admin API error', err);
    return json({ error: 'Something went wrong on the server.' }, 500);
  }
};
