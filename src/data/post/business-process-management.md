---
publishDate: 2026-11-08T00:00:00Z
author: Tim Kleier
coAuthor: Claude (Anthropic)
title: 'Business Process Management: The Copies Drift'
excerpt: 'Three copies of one process. The examples that hold are a step, a role, and a rule. The diagram is the copy that drifts.'
category: Operations
tags:
  - business process management
  - operations
targetKeyword: business-process-management
---

A customer asks where their order is. Support opens the tracking page, the warehouse opens a different screen, and the two answers disagree by a day. Nobody is lying. The company has three versions of "fulfill an order," and business process management is the work of making that one process.

That is a smaller claim than the software category named after it. Managing a process means you can point at the steps, the person accountable for each one, and the rule that decides whether the next step is allowed. If you cannot point at those, you have activity. You do not have a process.

## What a process actually is

A process is a piece of work with a start, a finish, and a handoff in between. Order fulfillment starts when a customer pays and finishes when delivery is confirmed. Between those, someone receives the order, someone checks the payment, someone holds the stock, someone packs it, someone hands it to a carrier.

Each of those is a step with a role on it. The order manager receives and checks payment. The warehouse lead reserves, packs, and dispatches. Support confirms delivery. The operations director owns the whole process, which means the director is who you call when the steps disagree, not a name in a footer.

A rule sits on the handoff that usually goes wrong. No stock is reserved until payment authorization has cleared. That sentence is the process. A status field named "paid" is not, because a status field can be set by anyone, in any order, for any reason.

## What managing it looks like

Teams manage a process when a change to the work changes the description, and a change to the description changes the work. The practical test is a small one. Move "verify payment" to after "reserve inventory," the way a Friday bugfix tends to. Does any document, permission, or agent notice?

In most companies, no. The wiki still says payment first. The service reserves stock on the way in. Support reads the wiki to the customer. The warehouse trusts the queue. Business process management, on that day, is a meeting where those four sources are read aloud until someone picks a winner.

The examples that hold up are boring on purpose.

**Onboarding.** A new hire is a process: account, equipment, access, first week of work. The failure mode is a checklist in a doc the manager copies forward. Access is granted because someone asked in chat, not because the step says so. Managing it means the role, the access, and the checklist are one description. When the role changes, the access changes.

**A refund.** Support wants to say yes. Finance wants a limit. The process is the limit, the person who can cross it, and the record that they did. A shared inbox is not a process. It is a pile.

**Fulfillment, again.** The handoff from the order manager to the warehouse lead is the whole business. If that handoff is a row in a model, with a rule on it, an agent can pack the order under the same rule a person uses. If the handoff is a sentence in a doc, the agent invents a rule, and you meet it in a reconciliation report.

## Why the effort drifts

Most business process management efforts produce a diagram and stop. The diagram is accurate the week of the workshop. The software keeps shipping. The diagram does not hear about the ship. A quarter later the diagram is what leadership remembers and the code is what customers get. Both are called the process.

The drift is not a discipline problem. A picture of the work does not participate in the work, so nothing forces it to stay true. A model that the application and the agent read will be corrected the first time it is wrong, because the wrongness shows up as a blocked step rather than as a stale slide.

This is also why a BPM suite and a description of the process get confused. A suite that runs the work on its own engine is a system of record. It is the right tool when the work has no other home. It does not, by itself, keep your application and your agents honest about a process they run somewhere else. That job is the model.

[Business process management software](/business-process-software) is the commercial version of this argument: where a suite is the right buy, and where the missing piece is a process described as data. The notation people use to draw the process is a separate question, covered in [business process modeling notation](/blog/business-process-modeling).
