---
publishDate: 2026-11-08T00:00:00Z
author: Tim Kleier
coAuthor: Claude (Anthropic)
title: 'Business Process Modeling with DNA'
excerpt: 'Business process modeling with DNA writes the process as roles, steps, and rules. Notation leaves it in a diagram. Management leaves it in slides.'
category: Operations
tags:
  - business process modeling
  - bpmn
  - business process management
  - operations
targetKeyword: business-process-modeling
---

Business process modeling with DNA is naming a process so software can read it. The name is data: the roles, the steps, the rules, and the handoffs. A screen can read those rows. An agent can read them. A new hire can read them. It is the same description each time.

Take fulfillment. A customer pays. An order manager receives the order and checks the payment. A warehouse lead holds the stock, packs it, and hands it to a carrier. Support confirms delivery. One rule sits on the handoff that usually goes wrong: no stock moves until the payment has cleared.

That is the model. Four things, and then you can stop.

**Roles.** Who is accountable. Order manager, warehouse lead, support lead. A role can be a person or, later, an agent. If the model says "the warehouse," you cannot tell whether the packer or the lead is allowed to dispatch.

**Steps.** The work in the order it happens, each step small enough that one role finishes it. "Fulfill the order" is a wish. "Reserve inventory" is a step.

**Rules.** The decision. Payment before stock. Only the warehouse dispatches. A rule in the model is a rule the next system can enforce.

**Handoffs.** The order manager finishes the payment check and the warehouse lead starts the hold. The payload is the order and the payment state. Model the handoff and you have modeled the argument the teams are already having.

## Business Process Modeling Notation

Business process modeling notation draws that same fulfillment. A circle starts it, a rounded box is a task, a diamond is the payment check, an arrow is the order. A trained reader can look at the page and tell you who does what.

The drawing is the right way to look at a process in a room. It is also where the work gets stuck. The diagram is accurate the week of the workshop. The checkout service does what shipped. Nothing in the drawing hears about the ship, so the notation stays a diagram. [How DNA maps onto BPMN](/docs/frameworks) is the field-by-field version. What leaves the room is a role, a step, and a rule that software can read.

## Business Process Management

Business process management is the effort to keep one process from splitting into copies. Support, the warehouse, and the service each hold one, and the copies disagree. The usual result is a slide. Boxes for the functions, arrows for the handoffs, a footnote about the systems.

The slides get stuck the same way the diagram does. A picture of the work does not take part in the work, so nothing forces it to stay true. Move "verify payment" to after "reserve inventory," the way a Friday bugfix tends to. The deck still says payment first. The service reserves stock on the way in. The meeting that follows is people reading the copies aloud until someone picks a winner.

A model that the procedure, the permissions, and the agent read gets corrected the first time it is wrong. The wrongness shows up as a blocked step, not as a stale slide.

[Business process management software](/business-process-software) is the choice that follows: a suite that runs the work on its own engine, or a description the systems you already run can read. The model is the piece that stays either way.
