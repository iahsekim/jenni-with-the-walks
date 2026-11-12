// Runs automatically after every verified (non-spam) Netlify Forms submission.
// 1. Saves the request as a lead for the /admin dashboard (Netlify Blobs).
// 2. Sends a branded email to Jenni and a confirmation copy to the person who submitted.
// Email needs the env var GMAIL_APP_PASSWORD (GMAIL_USER defaults to Jenni's address).
import nodemailer from 'nodemailer';
import { connectLambda } from '@netlify/blobs';
import { ownerEmail, submitterEmail } from './emails.mjs';
import { leadFromForm, saveLead } from '../../lib/leads.mjs';

const TO = 'jenniwiththewalks@gmail.com';

export const handler = async (event) => {
  let payload;
  try {
    payload = JSON.parse(event.body || '{}').payload || {};
  } catch {
    return { statusCode: 400, body: 'Bad payload' };
  }
  if (payload.form_name !== 'meet-greet') return { statusCode: 200, body: 'Ignored' };

  const d = payload.data || {};

  try {
    connectLambda(event);
    await saveLead(leadFromForm(d, { id: payload.id, createdAt: payload.created_at }));
  } catch (err) {
    console.error('Could not save lead to dashboard storage:', err);
  }

  const user = process.env.GMAIL_USER || TO;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    console.error('GMAIL_APP_PASSWORD is not set. Skipping emails.');
    return { statusCode: 200, body: 'Email not configured' };
  }

  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  const from = { name: 'Jenni with the Walks', address: user };

  const owner = ownerEmail(d);
  const jobs = [
    transport.sendMail({ from, to: TO, replyTo: d.email ? { name: d.name || '', address: d.email } : undefined, ...owner }),
  ];
  if (d.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) {
    jobs.push(transport.sendMail({ from, to: { name: d.name || '', address: d.email }, replyTo: TO, ...submitterEmail(d) }));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r, i) => { if (r.status === 'rejected') console.error(`Email ${i} failed:`, r.reason); });
  return { statusCode: 200, body: 'OK' };
};
