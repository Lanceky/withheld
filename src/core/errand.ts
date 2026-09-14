/**
 * Errand files: load, validate, and gate before anything is generated.
 *
 * The file is checked before a script exists, because some things are not
 * budget items at all. A budget that authorizes a payment card is a malformed
 * budget, not permission — so those are refused at load, whatever the file says.
 */

import { z } from 'zod';
import { refusesCall, scanForNumbers, scanForProhibited } from './budget.js';
import type { ErrandFile, Finding } from './types.js';

const timeWindow = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
});

export const errandSchema = z.object({
  errand_id: z.string().min(1),
  person: z.object({
    name: z.string().min(1),
    phone: z.string().min(7),
  }),
  callee: z.object({
    name: z.string().min(1),
    phone: z.string().min(7),
  }),
  reason: z.string(),
  goal: z.string().min(1),
  questions: z
    .array(z.object({ id: z.string().min(1), ask: z.string().min(1) }))
    .min(1),
  disclosure_budget: z.array(z.string().min(1)),
  acceptable_windows: z.array(timeWindow).min(1),
  never_disclose: z.array(z.string()).optional(),
});

export interface LoadResult {
  ok: boolean;
  errand: ErrandFile | null;
  findings: Finding[];
  errors: string[];
}

/**
 * The `reason` field never leaves this process. It is the one part of the file
 * that explains *why* a person cannot use a phone, and the callee has no need
 * for it.
 */
export function loadErrand(raw: unknown): LoadResult {
  const parsed = errandSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      errand: null,
      findings: [],
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }

  const errand = parsed.data as ErrandFile;
  const budgetText = errand.disclosure_budget.join('\n');
  const questionText = errand.questions.map((q) => q.ask).join('\n');
  const surface = [budgetText, questionText, errand.goal].join('\n');

  const findings: Finding[] = [
    ...scanForProhibited(surface, 'errand_file'),
    ...scanForNumbers({
      text: surface,
      personPhone: errand.person.phone,
      where: 'errand_file',
    }),
  ];

  if (refusesCall(findings)) {
    return {
      ok: false,
      errand,
      findings,
      errors: [
        'The errand file carries something that may never be spoken. No script was generated and no call was placed.',
      ],
    };
  }

  return { ok: true, errand, findings, errors: [] };
}
