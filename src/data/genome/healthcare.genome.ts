// Cedar Ridge Clinic — the health care genome.
//
// Value proposition it has to make obvious: care pathways, staffing, and the rules that bind
// them. So the process is a pathway a patient actually walks, every step is owned by a role a
// clinic actually has, and the rules are the ones that decide who may touch a record — which is
// why this genome's spotlight leans on policies and access control rather than screens.
//
// **The nouns are FHIR's, not ours.** Patient, Encounter, Condition, Observation,
// ServiceRequest, CarePlan, Consent and Coverage are all R4 resource names, and the field names
// follow R4 too — `birthDate`, not `dateOfBirth`; `effectiveDateTime`, not `takenAt`. Encounter
// classes are the HL7 v3 ActCode values a real system stores (AMB, EMER, IMP, VR). Codes are
// carried in the system that owns them: LOINC for observations, ICD-10-CM for conditions.
// A clinical informaticist should recognise every field on sight.

import type { AuthoredGenome } from '~/utils/genome-types';

export const healthcare: AuthoredGenome = {
  key: 'healthcare',
  ontologies: [
    {
      name: 'HL7 FHIR R4',
      note: 'Resource names and field names — Patient, Encounter, ServiceRequest, CarePlan, Consent.',
    },
    { name: 'HL7 v3 ActCode', note: 'Encounter classes: AMB, EMER, IMP, VR.' },
    { name: 'LOINC', note: 'Observation codes.' },
    { name: 'ICD-10-CM', note: 'Condition codes.' },
  ],
  domain: 'CedarRidgeClinic',
  domainPath: 'cedarridge.clinic',
  orgName: 'Cedar Ridge Clinic',
  description:
    'A multi-provider outpatient clinic running intake through discharge under consent, privacy, and escalation rules.',

  resources: [
    {
      name: 'Patient',
      description: 'A person under the clinic’s care, with their demographics and consent state.',
      attributes: [
        { name: 'identifier', type: 'string', required: true, description: 'MRN — FHIR Patient.identifier.' },
        { name: 'birthDate', type: 'date', required: true, description: 'FHIR Patient.birthDate.' },
        { name: 'active', type: 'boolean', required: true, description: 'FHIR Patient.active.' },
        { name: 'generalPractitioner', type: 'string', description: 'FHIR Patient.generalPractitioner.' },
      ],
      actions: [
        { name: 'Register', type: 'write', description: 'Create or update the patient record at intake.' },
        { name: 'Read', type: 'read', description: 'Open the chart.' },
      ],
    },
    {
      name: 'Encounter',
      description: 'One visit — the unit everything clinical hangs off.',
      attributes: [
        {
          name: 'class',
          type: 'enum',
          values: ['AMB', 'EMER', 'IMP', 'VR'],
          required: true,
          description: 'HL7 v3 ActCode — ambulatory, emergency, inpatient, virtual.',
        },
        { name: 'period', type: 'datetime', required: true, description: 'FHIR Encounter.period.start.' },
        {
          name: 'priority',
          type: 'enum',
          values: ['routine', 'urgent', 'asap', 'stat'],
          required: true,
          description: 'FHIR request priority, used here as triage acuity.',
        },
        {
          name: 'status',
          type: 'enum',
          values: ['planned', 'in-progress', 'finished', 'cancelled'],
          description: 'FHIR Encounter.status.',
        },
      ],
      actions: [
        { name: 'Triage', type: 'write', description: 'Assign FHIR priority and route the patient.' },
        { name: 'Assess', type: 'write', description: 'Record the clinical assessment.' },
        { name: 'Discharge', type: 'write', description: 'Set disposition and finish the encounter.' },
      ],
    },
    {
      name: 'CarePlan',
      description: 'FHIR CarePlan — addresses a Condition, carries goals and the review date.',
      attributes: [
        { name: 'addresses', type: 'string', required: true, description: 'FHIR CarePlan.addresses — the Condition.' },
        { name: 'goal', type: 'text', description: 'FHIR CarePlan.goal.' },
        {
          name: 'status',
          type: 'enum',
          values: ['draft', 'active', 'on-hold', 'completed', 'revoked'],
          required: true,
          description: 'FHIR CarePlan.status.',
        },
        { name: 'periodEnd', type: 'date', description: 'FHIR CarePlan.period.end — the review date.' },
      ],
      actions: [{ name: 'Update', type: 'write', description: 'Revise the plan after an assessment.' }],
    },
    {
      name: 'ServiceRequest',
      description: 'FHIR ServiceRequest — a lab, imaging, medication, or referral order on an encounter.',
      attributes: [
        {
          name: 'category',
          type: 'enum',
          values: ['laboratory', 'imaging', 'medication', 'referral'],
          required: true,
          description: 'FHIR ServiceRequest.category.',
        },
        { name: 'code', type: 'string', required: true, description: 'The ordered item, LOINC- or CPT-coded.' },
        {
          name: 'intent',
          type: 'enum',
          values: ['proposal', 'plan', 'order'],
          required: true,
          description: 'FHIR ServiceRequest.intent.',
        },
        {
          name: 'status',
          type: 'enum',
          values: ['draft', 'active', 'on-hold', 'completed', 'revoked'],
          required: true,
          description: 'FHIR request status.',
        },
      ],
      actions: [
        { name: 'Submit', type: 'write', description: 'Send the request to the fulfilling service.' },
        { name: 'List', type: 'read', description: 'List requests on an encounter.' },
      ],
    },
    {
      name: 'Consent',
      description: 'FHIR Consent — what the patient permitted, for which purpose, and until when.',
      attributes: [
        {
          name: 'scope',
          type: 'enum',
          values: ['patient-privacy', 'treatment', 'research'],
          required: true,
          description: 'FHIR Consent.scope.',
        },
        {
          name: 'status',
          type: 'enum',
          values: ['draft', 'active', 'inactive'],
          required: true,
          description: 'FHIR Consent.status.',
        },
        { name: 'dateTime', type: 'date', required: true, description: 'FHIR Consent.dateTime.' },
        { name: 'provisionPeriodEnd', type: 'date', description: 'FHIR Consent.provision.period.end.' },
      ],
      actions: [{ name: 'Verify', type: 'read', description: 'Confirm an active Consent covers this purpose.' }],
    },
    {
      name: 'Observation',
      description: 'FHIR Observation — a measurement or finding, LOINC-coded.',
      attributes: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'LOINC code, e.g. 8480-6 systolic blood pressure.',
        },
        { name: 'valueQuantity', type: 'number', required: true, description: 'FHIR Observation.valueQuantity.value.' },
        { name: 'unit', type: 'string', description: 'UCUM unit, e.g. mm[Hg].' },
        {
          name: 'effectiveDateTime',
          type: 'datetime',
          required: true,
          description: 'FHIR Observation.effectiveDateTime.',
        },
      ],
      actions: [{ name: 'Record', type: 'write', description: 'Record a vital sign or result against the encounter.' }],
    },
    {
      name: 'Condition',
      description: 'FHIR Condition — a problem on the patient’s list, ICD-10-CM coded.',
      attributes: [
        {
          name: 'code',
          type: 'string',
          required: true,
          description: 'ICD-10-CM code, e.g. I10 essential hypertension.',
        },
        {
          name: 'clinicalStatus',
          type: 'enum',
          values: ['active', 'recurrence', 'remission', 'resolved'],
          required: true,
          description: 'FHIR Condition.clinicalStatus.',
        },
        { name: 'onsetDateTime', type: 'date', description: 'FHIR Condition.onsetDateTime.' },
      ],
      actions: [{ name: 'Diagnose', type: 'write', description: 'Add or revise a problem on the patient’s list.' }],
    },
  ],

  // FHIR's own party resources, rather than a generic "Employee".
  persons: [
    { name: 'Practitioner', description: 'FHIR Practitioner — a licensed or credentialed clinician.' },
    { name: 'Patient', description: 'FHIR Patient — a person receiving care.' },
    { name: 'RelatedPerson', description: 'FHIR RelatedPerson — a guardian or proxy acting for a patient.' },
  ],

  roles: [
    { name: 'MedicalDirector', description: 'Clinically accountable for the practice and its protocols.' },
    { name: 'Physician', parent: 'MedicalDirector', description: 'Assesses, diagnoses, and orders.' },
    { name: 'TriageNurse', parent: 'MedicalDirector', description: 'Sets acuity and routes patients on arrival.' },
    { name: 'CareCoordinator', parent: 'Physician', description: 'Owns the care plan and the follow-up loop.' },
    {
      name: 'FrontDeskCoordinator',
      parent: 'MedicalDirector',
      description: 'Registers patients and verifies consent and coverage.',
    },
  ],

  groups: [
    { name: 'CareTeam', description: 'Everyone clinically involved in one patient’s encounter.' },
    { name: 'AdministrativeStaff', description: 'Registration, scheduling, and records.' },
  ],

  memberships: [
    { name: 'PractitionerAsPhysician', person: 'Practitioner', role: 'Physician', group: 'CareTeam' },
    { name: 'PractitionerAsTriageNurse', person: 'Practitioner', role: 'TriageNurse', group: 'CareTeam' },
    { name: 'PractitionerAsCareCoordinator', person: 'Practitioner', role: 'CareCoordinator', group: 'CareTeam' },
    {
      name: 'PractitionerAsFrontDesk',
      person: 'Practitioner',
      role: 'FrontDeskCoordinator',
      group: 'AdministrativeStaff',
    },
    { name: 'PractitionerAsMedicalDirector', person: 'Practitioner', role: 'MedicalDirector', group: 'CareTeam' },
  ],

  operations: [
    { target: 'Patient', action: 'Register', description: 'Create or update the patient record at intake.' },
    { target: 'Patient', action: 'Read', description: 'Open a patient chart.' },
    { target: 'Consent', action: 'Verify', description: 'Confirm consent covers the intended purpose.' },
    { target: 'Encounter', action: 'Triage', description: 'Assign acuity and route the patient.' },
    { target: 'Encounter', action: 'Assess', description: 'Record the clinical assessment.' },
    { target: 'Encounter', action: 'Discharge', description: 'Set disposition and finish the encounter.' },
    { target: 'Encounter', action: 'List', description: 'List encounters on the board.' },
    { target: 'ServiceRequest', action: 'Submit', description: 'Send a clinical request to the fulfilling service.' },
    { target: 'ServiceRequest', action: 'List', description: 'List requests on an encounter.' },
    { target: 'CarePlan', action: 'Update', description: 'Revise the plan of care.' },
  ],

  process: {
    name: 'PatientCarePathway',
    description: 'Arrival through discharge, with consent verified before any chart is opened.',
    operator: 'MedicalDirector',
    steps: [
      {
        id: 'register-patient',
        title: 'Register patient',
        actor: 'FrontDeskCoordinator',
        operation: 'Patient.Register',
        description: 'Confirm identity, demographics, and coverage; open the encounter.',
      },
      {
        id: 'verify-consent',
        title: 'Verify consent',
        actor: 'FrontDeskCoordinator',
        operation: 'Consent.Verify',
        description: 'Confirm a current consent covers treatment before the chart is opened.',
        consulted: ['MedicalDirector'],
      },
      {
        id: 'triage',
        title: 'Triage',
        actor: 'TriageNurse',
        operation: 'Encounter.Triage',
        description: 'Take vitals, set acuity, and route — anything emergent leaves the pathway here.',
        consulted: ['Physician'],
      },
      {
        id: 'assess',
        title: 'Assess',
        actor: 'Physician',
        operation: 'Encounter.Assess',
        description: 'Examine, form the working diagnosis, and record the assessment.',
      },
      {
        id: 'submit-requests',
        title: 'Submit requests',
        actor: 'Physician',
        operation: 'ServiceRequest.Submit',
        description: 'Order labs, imaging, medication, or a referral against the encounter.',
        consulted: ['CareCoordinator'],
      },
      {
        id: 'update-care-plan',
        title: 'Update care plan',
        actor: 'CareCoordinator',
        operation: 'CarePlan.Update',
        description: 'Revise problems, goals, and the review date; schedule the follow-up.',
      },
      {
        id: 'discharge',
        title: 'Discharge',
        actor: 'Physician',
        operation: 'Encounter.Discharge',
        description: 'Give discharge instructions, set disposition, and close the encounter.',
        consulted: ['CareCoordinator'],
      },
    ],
  },

  rules: [
    {
      name: 'ConsentPrecedesChartAccess',
      operation: 'Patient.Read',
      ruleType: 'condition',
      description: 'A chart does not open until a current consent covering treatment is on file.',
    },
    {
      name: 'OnlyCliniciansAssess',
      operation: 'Encounter.Assess',
      ruleType: 'access',
      description: 'Assessment is a clinical act. Administrative staff never perform one.',
      allow: [{ role: 'Physician' }, { role: 'MedicalDirector' }],
    },
    {
      name: 'PrescribingIsLicensed',
      operation: 'ServiceRequest.Submit',
      ruleType: 'access',
      description: 'Orders are placed by the licensed provider who will answer for them.',
      allow: [{ role: 'Physician' }, { role: 'MedicalDirector' }],
    },
    {
      name: 'TriageBelongsToNursing',
      operation: 'Encounter.Triage',
      ruleType: 'access',
      description: 'Acuity is set by triage nursing, so the standard is applied the same way every time.',
      allow: [{ role: 'TriageNurse' }, { role: 'MedicalDirector' }],
    },
    {
      name: 'RegistrationIsFrontDesk',
      operation: 'Patient.Register',
      ruleType: 'access',
      description: 'Demographics and coverage are captured once, by the desk that owns them.',
      allow: [{ role: 'FrontDeskCoordinator' }, { role: 'MedicalDirector' }],
    },
  ],

  triggers: [
    { source: 'user', process: 'PatientCarePathway', description: 'A patient arrives or checks in.' },
    {
      source: 'schedule',
      operation: 'CarePlan.Update',
      schedule: '0 7 * * *',
      description: 'Daily sweep for care plans past their review date.',
    },
  ],

  product: {
    resources: [
      {
        name: 'Encounter',
        resource: 'Encounter',
        description: 'The clinical board’s working record.',
        fields: [
          { name: 'patient', label: 'Patient', type: 'string', required: true },
          {
            name: 'visitType',
            label: 'Visit',
            type: 'enum',
            values: ['new', 'follow-up', 'urgent', 'telehealth'],
            required: true,
          },
          {
            name: 'acuity',
            label: 'Acuity',
            type: 'enum',
            values: ['routine', 'elevated', 'urgent', 'emergent'],
            required: true,
          },
          { name: 'arrivedAt', label: 'Arrived', type: 'datetime', required: true, readonly: true },
          { name: 'provider', label: 'Provider', type: 'string' },
        ],
        actions: [{ name: 'Triage' }, { name: 'Close' }],
        samples: [
          {
            patient: 'M. Alvarez',
            visitType: 'urgent',
            acuity: 'elevated',
            arrivedAt: '2026-08-18 08:14',
            provider: 'Dr. Reyes',
          },
          {
            patient: 'J. Whitfield',
            visitType: 'follow-up',
            acuity: 'routine',
            arrivedAt: '2026-08-18 08:40',
            provider: 'Dr. Osei',
          },
          {
            patient: 'S. Nakamura',
            visitType: 'new',
            acuity: 'routine',
            arrivedAt: '2026-08-18 09:05',
            provider: 'Dr. Reyes',
          },
          {
            patient: 'D. Kowalski',
            visitType: 'telehealth',
            acuity: 'routine',
            arrivedAt: '2026-08-18 09:30',
            provider: 'Dr. Osei',
          },
        ],
      },
      {
        name: 'Patient',
        resource: 'Patient',
        description: 'The chart header.',
        fields: [
          { name: 'mrn', label: 'MRN', type: 'string', required: true, readonly: true },
          { name: 'name', label: 'Name', type: 'string', required: true },
          { name: 'dateOfBirth', label: 'DOB', type: 'date', required: true },
          { name: 'consentOnFile', label: 'Consent', type: 'boolean', required: true },
        ],
        actions: [{ name: 'Register' }],
        samples: [
          { mrn: 'CR-40182', name: 'M. Alvarez', dateOfBirth: '1979-03-12', consentOnFile: true },
          { mrn: 'CR-40183', name: 'J. Whitfield', dateOfBirth: '1962-11-02', consentOnFile: true },
          { mrn: 'CR-40184', name: 'S. Nakamura', dateOfBirth: '1994-06-25', consentOnFile: false },
        ],
      },
      {
        name: 'ServiceRequest',
        resource: 'ServiceRequest',
        description: 'Requests placed against an encounter.',
        fields: [
          {
            name: 'kind',
            label: 'Type',
            type: 'enum',
            values: ['lab', 'imaging', 'medication', 'referral'],
            required: true,
          },
          { name: 'detail', label: 'Detail', type: 'string', required: true },
          {
            name: 'status',
            label: 'Status',
            type: 'enum',
            values: ['draft', 'placed', 'resulted', 'cancelled'],
            required: true,
          },
          { name: 'orderedBy', label: 'Ordered by', type: 'string' },
        ],
        actions: [{ name: 'Submit' }],
        samples: [
          { kind: 'lab', detail: 'CBC with differential', status: 'resulted', orderedBy: 'Dr. Reyes' },
          { kind: 'imaging', detail: 'Chest X-ray, 2 view', status: 'placed', orderedBy: 'Dr. Reyes' },
          { kind: 'referral', detail: 'Cardiology, routine', status: 'draft', orderedBy: 'Dr. Osei' },
        ],
      },
      {
        name: 'CarePlan',
        resource: 'CarePlan',
        description: 'Problems, goals, and review dates.',
        fields: [
          { name: 'problem', label: 'Problem', type: 'string', required: true },
          { name: 'goal', label: 'Goal', type: 'text' },
          { name: 'reviewDue', label: 'Review due', type: 'date' },
        ],
        actions: [{ name: 'Update' }],
        samples: [
          { problem: 'Hypertension, stage 1', goal: 'BP under 130/80 by November', reviewDue: '2026-11-01' },
          { problem: 'Type 2 diabetes', goal: 'A1c under 7.0', reviewDue: '2026-10-15' },
        ],
      },
    ],
    namespace: {
      name: 'Clinical',
      path: '/api/clinical',
      description: 'Encounter, chart, order, and consent operations.',
    },
    endpoints: [
      { method: 'GET', path: '/encounters', operation: 'Encounter.List', description: 'Today’s board.' },
      {
        method: 'POST',
        path: '/encounters/{id}/triage',
        operation: 'Encounter.Triage',
        description: 'Set acuity and route.',
      },
      {
        method: 'POST',
        path: '/encounters/{id}/close',
        operation: 'Encounter.Discharge',
        description: 'Discharge and close.',
      },
      { method: 'GET', path: '/patients/{id}', operation: 'Patient.Read', description: 'Open a chart.' },
      { method: 'POST', path: '/patients', operation: 'Patient.Register', description: 'Register a patient.' },
      {
        method: 'GET',
        path: '/encounters/{id}/service-requests',
        operation: 'ServiceRequest.List',
        description: 'Requests on an encounter.',
      },
      {
        method: 'POST',
        path: '/service-requests',
        operation: 'ServiceRequest.Submit',
        description: 'Submit a clinical request.',
      },
    ],
    layout: { name: 'ClinicalShell', type: 'sidebar' },
    pages: [
      {
        name: 'EncounterBoard',
        resource: 'Encounter',
        description: 'Every patient in the building, by acuity.',
        blocks: [
          { name: 'EncounterTable', type: 'table', operation: 'Encounter.List' },
          { name: 'AcuitySummary', type: 'summary' },
        ],
      },
      {
        name: 'PatientChart',
        resource: 'Patient',
        description: 'One chart, gated on consent.',
        blocks: [
          { name: 'ChartForm', type: 'form', operation: 'Patient.Read' },
          { name: 'TriageAction', type: 'actions', operation: 'Encounter.Triage' },
        ],
      },
      {
        name: 'ServiceRequestQueue',
        resource: 'ServiceRequest',
        description: 'Requests awaiting submission or results.',
        blocks: [{ name: 'ServiceRequestTable', type: 'table', operation: 'ServiceRequest.List' }],
      },
      {
        name: 'CarePlanReview',
        resource: 'CarePlan',
        description: 'Plans past their review date.',
        blocks: [{ name: 'UpdateAction', type: 'actions', operation: 'CarePlan.Update' }],
      },
    ],
    routes: [
      { path: '/board', page: 'EncounterBoard', protected: true, description: 'Encounter board.' },
      { path: '/patients/:id', page: 'PatientChart', protected: true, description: 'Patient chart.' },
      {
        path: '/service-requests',
        page: 'ServiceRequestQueue',
        protected: true,
        description: 'Service request queue.',
      },
      { path: '/care-plans', page: 'CarePlanReview', protected: true, description: 'Care plan review.' },
    ],
  },

  technical: {
    providers: [
      {
        name: 'AWS',
        type: 'cloud',
        description: 'Clinical workloads in a HIPAA-eligible account.',
        region: 'us-east-2',
      },
      {
        name: 'AuroraPostgres',
        type: 'database',
        description: 'Encounters, charts, and service requests — encrypted at rest.',
        region: 'us-east-2',
      },
      { name: 'Redox', type: 'messaging', description: 'HL7 v2 and FHIR integration to referring systems.' },
      { name: 'Epic', type: 'other', description: 'The EHR of record this clinic exchanges FHIR resources with.' },
    ],
    environments: [
      { name: 'dev', description: 'Synthetic patients only. No PHI, ever.', providers: ['AWS', 'AuroraPostgres'] },
      {
        name: 'staging',
        description: 'De-identified data for release rehearsal.',
        providers: ['AWS', 'AuroraPostgres', 'Redox'],
      },
      { name: 'prod', description: 'Live clinical operations.', providers: ['AWS', 'AuroraPostgres', 'Redox', 'Epic'] },
    ],
    cells: [
      {
        name: 'ClinicalWeb',
        dna: 'CedarRidgeClinic.Product.Web',
        adapter: { type: 'nextjs', version: '15' },
        environment: 'prod',
        description: 'The board and the chart.',
      },
      {
        name: 'EncounterService',
        dna: 'CedarRidgeClinic.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Encounter lifecycle and triage.',
      },
      {
        name: 'ServiceRequestRouter',
        dna: 'CedarRidgeClinic.Product.Api',
        adapter: { type: 'nestjs', version: '10' },
        environment: 'prod',
        description: 'Requests out to lab, imaging, and pharmacy.',
      },
      {
        name: 'ConsentGate',
        dna: 'CedarRidgeClinic.Operational',
        adapter: { type: 'express', version: '4' },
        environment: 'prod',
        description: 'Enforces the consent rule ahead of every chart read.',
      },
      {
        name: 'ClinicalDb',
        dna: 'CedarRidgeClinic.Product.Core',
        adapter: { type: 'postgres', version: '16' },
        environment: 'prod',
        description: 'Patients, encounters, orders, care plans.',
      },
    ],
    connections: [
      { source: 'ClinicalWeb', target: 'EncounterService', type: 'data-flow', label: 'board' },
      { source: 'ClinicalWeb', target: 'ConsentGate', type: 'depends-on', label: 'chart access' },
      { source: 'ConsentGate', target: 'ClinicalDb', type: 'depends-on', label: 'consent lookup' },
      { source: 'EncounterService', target: 'ServiceRequestRouter', type: 'publishes-to', label: 'encounter.assessed' },
      { source: 'EncounterService', target: 'ClinicalDb', type: 'depends-on' },
      { source: 'ServiceRequestRouter', target: 'ClinicalDb', type: 'depends-on' },
    ],
  },
};

export default healthcare;
