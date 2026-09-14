# Withheld: 2 minute recording plan

Record at **https://withheld.vercel.app/** (not localhost: no dev banner, no
hiccup mid take). Browser at 1440px wide, zoom 110%, no other tabs, no
bookmarks bar. Hide the cursor when not clicking.

Scenario buttons, in the order they appear on the page:

| id | Button label |
| --- | --- |
| `happy` | They offer to call back |
| `demanded` | They insist on a number |
| `leaked` | A number gets out |
| `refused` | They cannot name a time |
| `vague` | They are vague |
| `noanswer` | Nobody answers |

---

## Screen recording timestamps (2:00)

| Time | Duration | What you do on screen |
| --- | --- | --- |
| **0:00** | 0:06 | Land on `https://withheld.vercel.app/`, untouched. Let the headline sit still. Do not move the mouse. |
| **0:06** | 0:08 | Slow scroll down the right rail: the crossed out handset, the masked number, the tally. Stop. Scroll back to top. |
| **0:14** | 0:04 | Hover over the scenario row so all six labels are readable. Do not click yet. |
| **0:18** | 0:03 | Click **They offer to call back**. |
| **0:21** | 0:14 | Timeline fills. Let it. Scroll slowly through the turns until the clinic offers to ring back. |
| **0:35** | 0:10 | **Stop here.** Hover the turn where the agent declines and asks for a window. This is the money shot. Do not scroll during this. |
| **0:45** | 0:10 | Scroll to the extracted window and its supporting quote. Pause on it. |
| **0:55** | 0:08 | Scroll to leg two being proposed into that window. Pause. |
| **1:03** | 0:04 | Click **They insist on a number**. |
| **1:07** | 0:11 | Timeline fills. Scroll to the point where the agent holds the line and the errand goes to a human. Pause on it. |
| **1:18** | 0:04 | Click **A number gets out**. |
| **1:22** | 0:10 | Scroll to the masked number in the report. Pause on it. |
| **1:32** | 0:12 | **Right click, View Page Source.** `Ctrl+F`, type `900456`, show **0 results**. Hold on the zero. Close the tab. |
| **1:44** | 0:06 | Back on the console, click **Nobody answers**. Show that it draws no verdict. |
| **1:50** | 0:10 | Scroll to the written report: answers with their quotes, and the disclosure line reading `number_disclosed: false`. |

**Hard rule:** do not narrate while recording. Record silent screen capture,
then lay the voiceover under it. Trying to do both is how takes get wasted.

**If you overrun:** cut 0:06 to 0:14 (the rail scroll) and 1:44 to 1:50
(`Nobody answers`) first. Never cut 0:35 to 0:45 or 1:32 to 1:44.

---

## AI voiceover script

Neutral, unhurried, slightly dry. No excitement, no sales voice. The content is
the argument. Suggested settings: stability high, style low, speed 0.95.

Timings below match the table above. Bracketed notes are direction, not spoken.

> **[0:00]**
> Every errand ends the same way. We'll call you back.
>
> **[0:05]**
> For most of us, that's mildly annoying. If you're Deaf, or non-speaking, or
> you can't hold a conversation with a stranger at a moment you didn't choose,
> that sentence doesn't delay the errand. It ends it.
>
> **[0:14]**
> A callback is a door you cannot open. So this agent never accepts one.
>
> **[0:18]**
> Here it's booking a clinic appointment. The call goes normally, right up
> until the clinic offers to ring the patient back.
>
> **[0:35]** *[slow down here, this is the point of the whole project]*
> Watch what it does. It declines. And it asks for a window to call in,
> instead. That's the entire idea. Never take a callback. Take a time.
>
> **[0:45]**
> The window is bound to the turn that produced it. If nobody named an actual
> time, it says unconfirmed. It doesn't guess, and it won't accept a slot
> outside the hours the patient set.
>
> **[0:55]**
> Then it proposes the second leg into that window. It never schedules a call
> on its own.
>
> **[1:03]**
> Now the harder case. The clinic insists on a number to ring back.
>
> **[1:07]**
> It doesn't have one. Not because it was told to keep it secret, but because
> the result schema handed to CALL-E has no field for a phone number. There's
> nowhere to put it. Holding the line is the success here, so the errand goes
> to a human rather than being dressed up as progress.
>
> **[1:18]**
> And the uncomfortable case. Here the clinic says the number out loud.
>
> **[1:22]**
> It's caught, masked, and reported. A leak is reported, never hidden.
>
> **[1:32]**
> And it isn't in the page source either. Zero results. That one took real
> work: our own framework was serialising the number into the payload of a
> product whose whole premise is that it never gets out.
>
> **[1:44]**
> Nobody picking up is a disposition, not a finding. No verdict is drawn.
>
> **[1:50]**
> Everything comes back in writing, because the person couldn't hear the call.
> Every answer carries the quote that supports it. No quote, no answer.

**Do not say** "AI that makes phone calls." Say what it refuses to do.

**Final line, if you have room at the end:**

> A hundred and thirty one tests, and not one of them needs a phone to ring.
