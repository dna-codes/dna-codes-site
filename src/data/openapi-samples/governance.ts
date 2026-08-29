// What governs each operation in the bundled samples — the half that is *not* in an OpenAPI
// document, and therefore the half a visitor's own pasted spec can never tell us.
//
// The demo's default is a gap report on an organisation that has already done most of the work:
// nearly every endpoint carries a rule, and a handful do not. A screen showing nothing governed is a
// strawman a reader dismisses; 22 of 26 governed is one they recognise, and then they start looking
// for their own four.
//
// **The gaps are chosen, not sampled.** In every sample the ungoverned operations are the ones that
// move money, write a prescription, or ship goods — because that is what a real estate looks like.
// Teams govern the endpoints they thought of, and the dangerous ones are dangerous precisely because
// nobody thought of them. A gap on `Customer.List` would be a rounding error. A gap on
// `Payment.Refund` is the finding.
//
// Rules are defined once and applied to many operations, which is how the model actually works: a
// rule is a thing with roles, a scope and an audit requirement, not a label per endpoint. It also
// means the accordion has something worth opening — a row that expanded to repeat its own title
// would not be worth a click.
//
// Absent from a map means ungoverned. That is the right default: governance is something somebody
// had to add, and treating silence as "governed" would flatter every reading on the page.
//
// This is sample data for a demo. A visitor who pastes their own document gets no governance
// reading at all, because we would be inventing it.

export interface Rule {
  name: string;
  /** Who holds it. */
  roles: string;
  scope: string;
  audit: string;
  feature?: string;
}

export const RULES: Record<string, Rule> = {
  'customer-access': {
    name: 'Customer Access',
    roles: 'Support.Agent, Finance.Admin',
    scope: 'Organization',
    audit: 'On write',
  },
  'customer-admin': {
    name: 'Customer Administration',
    roles: 'Finance.Admin',
    scope: 'Organization',
    audit: 'Required',
  },
  'payment-access': {
    name: 'Payment Access',
    roles: 'Support.Agent, Finance.Admin',
    scope: 'Organization',
    audit: 'On write',
  },
  'payment-authority': {
    name: 'Payment Authority',
    roles: 'Finance.Admin, Finance.Manager',
    scope: 'Organization',
    audit: 'Required',
    feature: 'payments_v2',
  },
  'billing-access': {
    name: 'Billing Access',
    roles: 'Finance.Admin, Billing.Clerk',
    scope: 'Organization',
    audit: 'On write',
  },
  'billing-authority': { name: 'Billing Authority', roles: 'Finance.Admin', scope: 'Organization', audit: 'Required' },
  'treasury-access': { name: 'Treasury Access', roles: 'Finance.Admin', scope: 'Organization', audit: 'Required' },
  'dispute-handling': {
    name: 'Dispute Handling',
    roles: 'Support.Lead, Finance.Admin',
    scope: 'Organization',
    audit: 'Required',
  },

  'clinical-access': { name: 'Clinical Access', roles: 'Clinician, Nurse', scope: 'Care team', audit: 'Required' },
  'clinical-authority': { name: 'Clinical Authority', roles: 'Clinician', scope: 'Care team', audit: 'Required' },
  registration: { name: 'Registration', roles: 'Front Desk, Clinician', scope: 'Practice', audit: 'On write' },
  scheduling: { name: 'Scheduling', roles: 'Front Desk, Clinician', scope: 'Practice', audit: 'On write' },
  'scheduling-admin': {
    name: 'Scheduling Administration',
    roles: 'Practice Manager',
    scope: 'Practice',
    audit: 'Required',
  },

  'order-access': { name: 'Order Access', roles: 'Ops.Analyst, Ops.Lead', scope: 'Region', audit: 'On write' },
  'order-entry': { name: 'Order Entry', roles: 'Ops.Analyst', scope: 'Region', audit: 'Required' },
  'order-admin': { name: 'Order Administration', roles: 'Ops.Lead', scope: 'Region', audit: 'Required' },
  'inventory-access': { name: 'Inventory Access', roles: 'Ops.Analyst, Ops.Lead', scope: 'Region', audit: 'On write' },
  'supplier-access': {
    name: 'Supplier Access',
    roles: 'Ops.Analyst, Procurement',
    scope: 'Organization',
    audit: 'On write',
  },
  reporting: { name: 'Reporting', roles: 'Ops.Analyst', scope: 'Region', audit: 'On write' },
};

/**
 * The rules offered to a visitor reading their *own* document.
 *
 * Generic on purpose, and the fourth one had to be replaced to stay that way. It was "Financial
 * Authority", held by "Finance, within a limit" — which is a guess about the reader's domain, and
 * therefore exactly the thing this comment claimed to avoid. It was offered against an e-commerce
 * spec and read as a non-sequitur, which is what a domain guess looks like when it misses.
 *
 * These four are levels of authority rather than kinds of business, so none of them presumes what
 * the reader does. "Requires Approval" also earns its place by not being role-based at all: a picker
 * where every option is another list of roles suggests that is all a rule can be.
 */
export const STARTER_RULES = ['starter-read', 'starter-write', 'starter-admin', 'starter-approval'] as const;

Object.assign(RULES, {
  'starter-read': { name: 'Read Access', roles: 'Anyone signed in', scope: 'Organization', audit: 'Not recorded' },
  'starter-write': { name: 'Write Authority', roles: 'Operators', scope: 'Organization', audit: 'Required' },
  'starter-admin': { name: 'Administrative', roles: 'Administrators', scope: 'Organization', audit: 'Required' },
  'starter-approval': {
    name: 'Requires Approval',
    roles: 'Two people, one of them an approver',
    scope: 'Organization',
    audit: 'Required',
  },
} satisfies Record<string, Rule>);

/** operation → the key of the rule that governs it. Absent means nothing does. */
export type Governance = Record<string, string>;

export const GOVERNANCE: Record<string, Governance> = {
  payments: {
    'Customer.List': 'customer-access',
    'Customer.Read': 'customer-access',
    'Customer.Create': 'customer-admin',
    'Customer.Update': 'customer-admin',
    'Customer.Delete': 'customer-admin',
    'PaymentMethod.List': 'customer-access',
    'PaymentMethod.Create': 'customer-admin',
    'Payment.List': 'payment-access',
    'Payment.Read': 'payment-access',
    'Payment.Create': 'payment-authority',
    'Payment.Capture': 'payment-authority',
    'Invoice.List': 'billing-access',
    'Invoice.Read': 'billing-access',
    'Invoice.Create': 'billing-authority',
    'Invoice.Update': 'billing-authority',
    'Invoice.Pay': 'payment-authority',
    'Invoice.Send': 'billing-authority',
    'Payout.List': 'treasury-access',
    'Payout.Read': 'treasury-access',
    'Dispute.List': 'dispute-handling',
    'Dispute.Read': 'dispute-handling',
    'Dispute.Evidence': 'dispute-handling',
    // Ungoverned, and every one of them moves money out of the business:
    //   Payment.Refund · Payment.Void · Payout.Create
  },

  clinic: {
    'Patient.List': 'clinical-access',
    'Patient.Read': 'clinical-access',
    'Patient.Create': 'registration',
    'Patient.Update': 'registration',
    'Appointment.List': 'scheduling',
    'Appointment.Read': 'scheduling',
    'Appointment.Create': 'scheduling',
    'Appointment.Update': 'scheduling',
    'Appointment.Confirm': 'scheduling',
    'Appointment.Delete': 'scheduling-admin',
    'Encounter.List': 'clinical-access',
    'Encounter.Read': 'clinical-access',
    'Encounter.Create': 'clinical-authority',
    'Note.List': 'clinical-access',
    'Note.Create': 'clinical-authority',
    'Prescription.List': 'clinical-access',
    // Ungoverned:
    //   Appointment.Cancel · Prescription.Create · Prescription.Refill
  },

  'internal-ops': {
    'Order.List': 'order-access',
    'Order.Read': 'order-access',
    'Order.Create': 'order-entry',
    'Order.Cancel': 'order-admin',
    'Warehouse.List': 'inventory-access',
    'Warehouse.Read': 'inventory-access',
    'Supplier.List': 'supplier-access',
    'Report.Run': 'reporting',
    // Ungoverned:
    //   Order.Fulfill · Shipment.Dispatch · Supplier.Approve
  },
};
