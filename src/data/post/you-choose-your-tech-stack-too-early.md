---
publishDate: 2026-10-11T00:00:00Z
series:
  name: The Future of Programming
  layer: 'Layer 07: Technology Stack'
author: Tim Kleier
title: 'You Choose Your Technology Stack Too Early'
excerpt: 'The first real decision on most projects is React or Vue, Postgres or Mongo — made before anyone has said precisely what the system is supposed to do. The stack then quietly bends the business to fit it, and everyone calls the result a requirement.'
image: '~/assets/images/abstraction-layers.png' # PLACEHOLDER — replace before publish
draft: true
category: Engineering
tags:
  - architecture
  - engineering leadership
  - technology strategy
  - abstraction
---

<!--
BRIEF — Series: The Future of Programming, layer 07 of 08.
Delete this block when the draft is written.

Audience shift: this is the piece for engineering leaders and architects rather
than for the AI-curious. It is also the most immediately actionable article in
the series — someone can change how their next kickoff runs on Monday. Write it
so that it stands alone for a reader who has never seen the series.

THESIS
Most projects choose their substrate before they have defined the system, and a
stack chosen that early does not stay neutral — it bends the operations to fit
itself. The ordering should be intent → semantics → ontology → operations →
execution → then technology.

THE SPINE
1. Open on a real kickoff. Week one, and the decisions on the board are framework,
   database, hosting, language. Nobody in the room can yet state what "paid" means
   or who is allowed to void an invoice. Both facts are normal. Only one of them
   is treated as a decision.
2. Why it happens, sympathetically — this piece fails if it sounds superior. The
   stack is the one decision that feels concrete on day one. It unblocks hiring,
   estimates, and the repo. Everything upstream feels like it can be figured out
   as you go, and usually it is, expensively.
3. The mechanism, which is the substance: how a substrate bends the model. The
   framework's idea of a user becomes your idea of a user. The ORM's cascade
   semantics become your deletion policy. The queue's at-least-once delivery
   becomes a business rule about duplicate payments. Give three or four of these,
   specific and recognizable. The point is that they are invisible — nobody
   experiences them as the stack deciding, they experience them as requirements.
4. The distinction that keeps this from being naive: this is not an argument for
   big design up front. Waterfall failed for reasons that have not stopped being
   true. Modeling the operations is not a nine-month specification phase — the
   model is small, it is revised constantly, and it is exactly the thing agile
   practice was right to iterate on. What agile never said was that the iteration
   should produce an artifact rather than only working software.
5. Reversibility as the practical frame. Bezos's one-way and two-way doors. A
   stack choice is a one-way door that everyone treats as reversible, made at the
   moment of least information. Modeling first does not eliminate the choice; it
   moves it to the moment of most information — and often makes it boring.
6. What "after" looks like concretely. When the operations are settled, the stack
   question changes shape: not "React or Vue" but "what does this set of
   operations actually need from a substrate?" — which is answerable.
7. THE HANDOFF SECTION (required in every piece — see planned_posts.md).
   In, from Code — "Binding": dependency resolution, framework conventions,
   linking. Reliable, boring, invisible. Then the turn: this handoff is solved,
   and we still make the choice that determines it before anything upstream exists.
   Out, to Machine — "Compilation": fully mechanical, and the subject of the
   closing piece.
8. Close toward the last piece: the whole series has been about handoffs. One
   handoff already works perfectly, and nobody thinks about it.

PRIOR ART
Architecture decision records. Clean/hexagonal architecture and "defer decisions"
— Uncle Bob's argument is the direct ancestor and should be credited, but note
that it defers the decision without giving you anything to defer it *against*.
C4 and arc42. The Bezos door framing. Fowler on sacrificial architecture.

DNA'S ONE NOVEL CLAIM
Again, a consequence rather than a product claim. The contribution over "defer
decisions" is that deferral needs a substitute: you can only postpone the stack
if the operations are written somewhere in the meantime. Otherwise "defer" just
means "decide later with the same lack of information."

FIGURE — interactive (house standard; see planned_posts.md)
The bending, shown rather than claimed. Reader picks a substrate first — Django +
Postgres, Rails, Next.js + Mongo, an event-sourced setup — and the operational
model underneath visibly deforms to fit it: the ORM's cascade becomes the deletion
policy, at-least-once delivery becomes a duplicate-payment rule, the framework's
user becomes your Customer. Same business, four different sets of "requirements,"
none of which anyone chose.

Then flip the order: settle the operations first, and the same four substrates
become a genuine comparison — each one shown against what the operations actually
need. The reader discovers that the second ordering makes the question answerable
and the first makes it invisible.

This is the piece where the interaction is most likely to produce a real reaction,
because every architect has lived at least one of those deformations and has
never seen it drawn.

LINKEDIN HOOK
"The first real decision on most projects is React or Vue. It gets made before
anyone can say what 'paid' means or who is allowed to void an invoice.
Then the stack decides those for you, and everyone calls it a requirement."

LINKS
Series map. This is a good candidate for zero product links — it is the piece most
likely to be shared by an architect who resents being marketed to.
-->
