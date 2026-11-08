---
publishDate: 2026-11-08T00:00:00Z
author: Tim Kleier
coAuthor: Claude (Anthropic)
title: 'Business Process Modeling Notation, Explained'
excerpt: 'Business process modeling notation draws a process. This guide writes the same process as data, with roles, steps and rules, and shows the BPMN beside it.'
category: Operations
tags:
  - bpmn
  - business process modeling
  - operations
targetKeyword: business-process-modeling-notation
---

Business process modeling notation is a drawing language. A circle starts the work, a rounded box is a task, a diamond is a decision, an arrow is the order. A trained reader can look at a page and tell you who does what, and what happens when the payment fails.

That is a real skill, and it is not the same skill as having a process. The drawing says what the workshop agreed. The checkout service does what shipped. Business process modeling notation, explained against a process you can run, is the gap between those two.

Take one process. A customer finishes checkout. An order manager receives the order and checks the payment. A warehouse lead holds the stock, packs it, and hands it to a carrier. Support confirms delivery. One rule sits in the middle: no stock moves until the payment has cleared.

## The same process, drawn and written

| Moment     | BPMN                                            | DNA                                                           |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Start      | A start event: the customer completes checkout. | A trigger on the process: a customer completes checkout.      |
| Receive    | A task, assigned to the order manager.          | A step, `receive order`, actor Order manager.                 |
| Decide     | A gateway after payment: cleared, or stop.      | A rule: no stock is reserved until authorization has cleared. |
| Hold stock | A task for the warehouse lead.                  | A step, `reserve inventory`, actor Warehouse lead.            |
| Finish     | An end event: delivery confirmed, order closed. | A step, `confirm delivery`, actor Customer support lead.      |

Read down either column and you get the same story. The left column is a picture. The right column is data: a role, a step, a rule. A picture has to be interpreted again every time someone builds a screen or writes an agent prompt. Data can be read by the screen and the agent.

The drawing is still the right way to look at a process in a room. [How DNA maps onto BPMN](/docs/frameworks), and onto the other frameworks a team already uses, is written up separately. The point of this page is what the drawing does not carry out of the room.

## Business process modeling

Business process modeling is the work of naming that story before anyone draws it. Four things, and then you can stop.

**Roles.** Who is accountable, not which department owns the slide. Order manager, warehouse lead, support lead. A role can be held by a person or, later, by an agent. The process does not care which, and it should not. If the model says "the warehouse," you cannot tell whether the packer or the lead is allowed to dispatch.

**Steps.** The work in the order it happens, each step small enough that one role finishes it. "Fulfill the order" is a wish. "Reserve inventory" is a step. A step has a name a new hire can repeat and a description that says what done looks like.

**Rules.** The decision the diamond was drawn to hold. Payment before stock. Only the warehouse dispatches. Only support authorizes a return. A rule that lives in the model is a rule the next system can enforce. A rule that lives in the diamond is a rule the next system will guess.

**Handoffs.** The arrow is the part that costs money. The order manager finishes payment and the warehouse lead starts the hold. If that handoff is a sentence, both sides invent the payload. If it is a step with an actor and a rule, the payload is the order, the payment state, and nothing else. Model the handoff and you have modeled the argument your teams are already having.

A BPMN example that includes those four is a useful drawing. A BPMN example that is only boxes is a poster. The notation can carry all four. Most diagrams stop at the boxes, because the boxes are what the tool makes easy and the rule is what the meeting ran out of time for.

## What you do with the model

Once the process is data, the drawing is a view. You can still print it for the workshop. You can also generate the procedure, the permissions, and the checklist from the same rows, and you can see the day they diverge.

That is the difference business process management software is sold to close, and often doesn't. A suite will store the diagram and, if you let it, run the work on its own engine. Useful when the suite is where the work lives. Useless when the work lives in the application you already shipped and the diagram is a souvenir of the design. [Business process management software](/business-process-software) walks that choice. The model is the piece that stays either way.
