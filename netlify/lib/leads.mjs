// Lead storage shared by the form handler and the admin API.
// Each lead is one JSON blob in the Netlify Blobs store "leads", keyed by id.
import { getStore } from '@netlify/blobs';

export const STATUSES = ['new', 'contacted', 'scheduled', 'client', 'closed'];

const store = () => getStore({ name: 'leads', consistency: 'strong' });

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function leadFromForm(d = {}, { id, createdAt, source = 'form' } = {}) {
  const now = new Date().toISOString();
  return {
    id: id || newId(),
    createdAt: createdAt || now,
    updatedAt: now,
    source,
    name: (d.name || '').trim(),
    phone: (d.phone || '').trim(),
    email: (d.email || '').trim(),
    options: [d.option_1, d.option_2, d.option_3].filter(Boolean),
    message: (d.message || '').trim(),
    interest: (d.interest || '').trim(),
    status: 'new',
    meeting: '',
    notes: [],
  };
}

export async function saveLead(lead) {
  await store().setJSON(lead.id, lead);
  return lead;
}

export const getLead = (id) => store().get(id, { type: 'json' });

export const deleteLead = (id) => store().delete(id);

export async function listLeads() {
  const s = store();
  const { blobs } = await s.list();
  const all = await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })));
  return all.filter(Boolean).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}
