# Withheld — Project Context

> **Working name:** Withheld. *"Number withheld"* is the standard telecom phrase for a
> suppressed number, and withholding the number is literally this app's thesis.
> Collision-checked against `apps/` and `skills/` — clear. (`ringfence` was the first
> choice and is **taken**: `apps/python/ringfence`, fraud verification.)

## 1. One-line pitch

For people who cannot take a phone call, Withheld removes the callback: it makes the
outbound calls an errand needs, refuses to hand over the person's number, extracts a
**time window** instead, and calls back itself inside that window — so a multi-step
errand completes without the person ever answering a phone.

## 2. The gap this fills (and the prior art it composes with)

This repository already solves the *first* call well:

- [`apps/typescript/call-on-behalf`](https://github.com/CALLE-AI/awesome-phone-call-agents/tree/main/apps/typescript/call-on-behalf)
  makes **one delegated outbound call**, says only what the person authorized, and
  returns what was said with transcript-bound evidence.
- [`skills/is-it-accessible`](https://github.com/CALLE-AI/awesome-phone-call-agents/tree/main/skills/is-it-accessible)
  asks venues per-need accessibility questions.
- [`skills/accesscall`](https://github.com/CALLE-AI/awesome-phone-call-agents/tree/main/skills/accesscall)
  runs phone intake for people who cannot complete web audit forms.

**None of them address what happens after that call ends.** Real errands are not one
call. They end with a commitment to ring you back:

> "The nurse will call you." · "We'll ring when the part comes in." · "Someone will
> phone Tuesday to confirm."

For a Deaf, non-speaking, or speech-disabled person that inbound call is the same
closed door, facing the other way — and it arrives from an unknown number, unscheduled,
with no text fallback. The errand stalls at step two. Nothing in this repository
handles it, and CALL-E is built around **outbound** calls, so "answer the phone for
them" is not a design that exists.

Withheld is the second half of the problem. It is explicitly **additive to
`call-on-behalf`, not a replacement** — the PR should say so and link it.

## 3. The core insight

> **A callback is a door you cannot open. So never accept one.**
> The agent does not give out the number. It takes the window and calls back itself.

Two consequences fall out of that single rule, and they are the product:

1. **The person never answers a phone — not once, across a multi-call errand.** Every
   inbound obligation is converted into a scheduled outbound call the system owns.
2. **The phone number is never disclosed at all.** The number is the most-leaked
   identifier in any errand, and the callback is precisely how it leaks. Refusing the
   callback is data minimisation as a side effect of accessibility.

A third, quieter consequence matters for judging: **the errand becomes a chain with
state**, not a single shot. That is a genuinely different object from a one-off call,
and it is what justifies an app with a console rather than another skill.

## 4. Grounding (the "SB 1162 / CASPER" equivalent)

Depth here is the moat, not novelty. Cite real instruments in the README:

| Instrument | Relevance |
| --- | --- |
| ADA Title III — *effective communication* (US) | A phone-only callback channel is a documented access barrier |
| Equality Act 2010 — *reasonable adjustments* (UK) | Businesses must not require a channel the person cannot use |
| Kenya Persons with Disabilities Act; Kenya Data Protection Act 2019 s.25 | Local grounding + data minimisation duty |
| GDPR Art. 5(1)(c) — *data minimisation* | A phone number is personal data; not disclosing it is minimisation by design |
| FCC TRS (47 CFR Part 64 subpart F) | The existing relay regime — name it to define what Withheld is **not** |

**Withheld is not a relay service and does not impersonate a person.** It announces
itself as an automated assistant calling on behalf of a named person with their
permission. Those limits are the design, not a disclaimer.

## 5. How it works

1. **Errand file** — the person authors the errand once: goal, the questions to ask,
   an explicit **disclosure budget** (exactly which facts may be said aloud), and
   acceptable time windows. The number is marked `never_disclose` by default.
2. **Call 1 (outbound)** — CALL-E places the call, says only budgeted facts, asks the
   questions.
3. **The callback gate** — when the callee offers to ring back, the agent does not
   accept and does not give the number. It asks the one question that converts an
   inbound obligation into an outbound one:
   > *"I can't take a call back — when should I call you instead?"*
   It extracts a commitment window, and refuses to leave the number even if pressed.
4. **Window extraction** — the returned window is only accepted when a callee turn in
   the transcript supports it. No supporting turn → `window_unconfirmed`, and the chain
   pauses for the person rather than guessing.
5. **Call 2..N (scheduled outbound)** — the app emits a scheduled *intent* for the next
   call inside that window. **Recurrence and scheduling belong to the host scheduler,
   per this repository's provider/host separation** — Withheld proposes, it does not
   run a daemon.
6. **Written return** — after every call the person gets, in text: what was asked, what
   was answered with the quoted turn, **what was disclosed about them**, the agreed
   window, and the current state of the chain.

## 6. Result schema (per call in the chain)

```json
{
  "errand_id": "string",
  "leg": 1,
  "status": "completed | window_agreed | window_unconfirmed | outcome_unknown | no_answer",
  "answers": [
    { "question": "string", "answer": "string | null", "supporting_turn": "string | null" }
  ],
  "callback_requested_by_callee": true,
  "number_disclosed": false,
  "agreed_window": {
    "start": "ISO8601 | null",
    "end": "ISO8601 | null",
    "supporting_turn": "string | null"
  },
  "disclosed_about_person": ["string"],
  "budget_violations": ["masked finding"],
  "next_action": "schedule_leg_2 | needs_human | errand_complete",
  "transcript_ref": "string"
}
```

## 7. What the report will not claim

Borrow this discipline from `call-on-behalf` — it is the house style and it is correct:

- A question is answered **only** when a callee turn supports it, after the caller
  asked it. Otherwise `null`, with a note if CALL-E claimed an answer.
- A window is agreed **only** when a callee turn names it. A window the caller
  proposed and nobody confirmed is `window_unconfirmed`.
- Only a **terminal** CALL-E status yields a verdict. `queued` / `in_progress` get no
  result.
- `outcome_unknown` is never rendered as failure or as "nothing was said".
- Budget findings are **masked** in every report — a privacy report that quotes the
  leak is not a privacy report.

## 8. Fail-closed rules

1. **No disclosure budget, no dial.**
2. **The number is never in the script.** A generated script containing anything
   number-shaped refuses the call before it is placed.
3. **Preview by default.** Fixture replay runs the whole chain with zero calls;
   `--real` is the only path to a dial.
4. **One call per leg.** No waterfalls, no retries without a human gate.
5. **Clinical, legal and financial wording in the goal raises a warning**, not an
   auto-approval.
6. **Ambiguity escalates to the person**, never to a guess.

## 9. Stack and layout

Target `apps/typescript/withheld/` — the app lane, which is what maintainers feature.

- **Next.js** console: the errand chain as a timeline (leg 1 → window → leg 2),
  each leg showing questions, quoted supporting turns, disclosure ledger, chain state.
- **vitest** fixtures: window agreed / window unconfirmed / callee refuses to schedule /
  callee demands the number / garbled / no answer / non-terminal status.
- **CALL-E SDK** (`@call-e/calle`) behind `--real`; `CALLE_API_KEY` server-side only.
- `README.md` + `SAFETY.md` + "When NOT to use".
- Web, not React Native: reviewers can run it, and AAC / screen-reader users are
  overwhelmingly on tablets and desktops.

## 10. Demo video outline (~3 min)

**Framing rule (legibility):** open on the *universal* experience, then narrow. Do not
open on accessibility — open on the sentence everyone has heard, and let the access case
land as the reason it matters. The errand on screen should be one anyone recognises
(a clinic booking), not an abstract scenario.

> Cold open: *"Every errand ends the same way: 'we'll call you back.' For some people,
> that sentence ends the errand."*

1. **The sentence (25s)** — an ordinary clinic booking. Call one goes fine. Then:
   *"the nurse will call you back."* Reveal the asymmetry: an unscheduled call from an
   unknown number, no text fallback. The errand is now stuck, permanently.
2. **Errand file (20s)** — disclosure budget, acceptable windows, number marked
   never-disclose.
3. **Leg 1, live (60s)** — CALL-E dials. The callee offers to ring back. **The agent
   declines and asks for a window instead, and holds the line when pressed for the
   number.** This is the money shot.
4. **The chain advances (30s)** — window extracted with its supporting quote; leg 2
   scheduled into it; console updates.
5. **Written return (20s)** — answers with quoted turns, disclosure ledger showing
   `number_disclosed: false`.
6. **Close (15s)** — it composes with `call-on-behalf`; what ships next.

## 11. Open risks

- [x] **Name collision** — `ringfence` taken (`apps/python/ringfence`, fraud
      verification). `withheld` checked clear across `apps/`, `skills/`, `plugins/`.
- [x] **Differentiation holds** — `wever-callback` (consignment boutique returning a
      customer's requested callback) and `evidence-grounded-callback` (consent-receipt
      gated business callback) are both *business calls a customer back*. Neither
      converts an inbound obligation into a scheduled outbound leg, and neither treats
      non-disclosure of the number as the goal. `call-on-behalf` stops after one call.
- [ ] **CALL-E scheduling surface** — confirm how a future-dated call intent is
      expressed, and keep recurrence with the host scheduler.
- [ ] **Can the agent hold the line?** Prompt instructions are not guaranteed
      enforcement. The number must be blocked at the **script-generation gate**, not
      trusted to the model — and the post-call scan must verify it never leaked.
- [ ] **Call budget** — 20 free calls. A chain burns 2+ per errand. Request more now.

## 12. Submission checklist

- [ ] CALL-E imported and actually invoked at runtime (not merely referenced)
- [ ] PR to `CALLE-AI/awesome-phone-call-agents` under `apps/`
- [ ] PR text credits `call-on-behalf` as prior art and states the additive scope
- [ ] Devpost form includes the PR URL
- [ ] ~3-minute public YouTube/Vimeo demo
- [ ] CALL-E account email included
- [ ] CALL-E Feedback Survey submitted (5 × $200 — the best odds in the event)
