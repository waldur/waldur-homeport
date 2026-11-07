import { WorkflowDescription } from 'waldur-js-client';

const flag = (value: boolean, because: any[] = []) => ({ value, because });

const cell = (actor: string, overrides: Record<string, any> = {}) => ({
  actor,
  sees: flag(false),
  reads_outputs: flag(false),
  contributes: flag(false),
  completes: flag(false),
  notified: { value: false, triggers: [], because: [] },
  ...overrides,
});

const ACTORS = [
  'applicant',
  'call_manager',
  'panel_chair',
  'panel_member',
  'reviewer',
  'offering_team',
];
const ALL_ACTORS = [
  ...ACTORS,
  'proposal_role:rapporteur',
  'proposal_role_lead:rapporteur',
  'system',
];

const step = (overrides: Record<string, any>, roles: any[]) => ({
  description: '',
  order: 0,
  stage: 0,
  parallel_with_previous: false,
  enabled: true,
  outcome_set: 'done',
  outcomes: [],
  on_negative: 'reject',
  transition_mode: 'automatic_on_completion',
  duration_in_days: null,
  run_condition: null,
  input_steps: [],
  is_allocation_decision: false,
  decides_automatically: false,
  allocation_time: null,
  include_award_response: false,
  allows_change_requests: false,
  completer: 'call_manager',
  completer_proposal_role: null,
  completion_lead_only: false,
  assigns_roles: [],
  contributors: {
    source: 'none',
    parameter: null,
    per_requested_offering: false,
    lead_only: false,
    min: null,
    max: null,
  },
  delegable_to: null,
  blind_review: false,
  requires_coi_confirmation: false,
  release_to_applicant: false,
  collects_reviewer_suggestions: false,
  min_score_threshold: null,
  checklist: null,
  criteria: 0,
  status_labels: {},
  applicant: {
    visible: false,
    label_kind: 'internal_check',
    label: 'Internal check',
    labels: {},
    internal: true,
  },
  notifications: [],
  extra: {},
  ...overrides,
  roles: ALL_ACTORS.map(
    (actor) => roles.find((r) => r.actor === actor) ?? cell(actor),
  ),
});

const stepRef = (stepKey: string, field: string) => ({
  source: 'step',
  step: stepKey,
  field,
  detail: null,
});

/** A small described workflow: a technical assessment beside a rapporteur
 * assignment, and a lead-only report the applicant reads once released. */
export const DESCRIPTION = {
  schema: 1,
  call: {
    name: 'Access call',
    state: 'draft',
    template: null,
    settings: {},
    target_decision_days: null,
    rounds: [],
    extra: {},
  },
  actors: [
    ...ACTORS.map((key) => ({
      key,
      kind: key,
      role_key: null,
      label: key,
      notes: [],
      holders: null,
    })),
    {
      key: 'proposal_role:rapporteur',
      kind: 'proposal_role',
      role_key: 'rapporteur',
      label: 'Rapporteur',
      notes: [],
      holders: null,
    },
    {
      key: 'proposal_role_lead:rapporteur',
      kind: 'proposal_role_lead',
      role_key: 'rapporteur',
      label: 'Lead Rapporteur',
      notes: [],
      holders: null,
    },
    {
      key: 'system',
      kind: 'system',
      role_key: null,
      label: 'System',
      notes: [],
      holders: null,
    },
  ],
  steps: [
    step(
      {
        key: 'technical',
        name: 'Technical assessment',
        kind: 'assessment',
        completer: 'offering_manager',
        duration_in_days: 21,
        contributors: {
          source: 'requested_offering_team',
          parameter: null,
          per_requested_offering: true,
          lead_only: false,
          min: null,
          max: null,
        },
        delegable_to: { target: 'offering_team', proposal_role: null },
      },
      [
        cell('offering_team', {
          completes: flag(true, [stepRef('technical', 'completer')]),
          contributes: flag(true, [stepRef('technical', 'delegable_to')]),
        }),
      ],
    ),
    step(
      {
        key: 'assignment',
        name: 'Rapporteur assignment',
        kind: 'assignment',
        order: 1,
        parallel_with_previous: true,
        completer: 'panel_chair',
        assigns_roles: ['rapporteur'],
      },
      [
        cell('panel_chair', {
          completes: flag(true, [stepRef('assignment', 'completer')]),
        }),
      ],
    ),
    step(
      {
        key: 'report',
        name: 'Consolidated report',
        kind: 'assessment',
        order: 2,
        stage: 2,
        completer: 'proposal_role',
        completer_proposal_role: 'rapporteur',
        completion_lead_only: true,
        input_steps: ['technical'],
        release_to_applicant: true,
        contributors: {
          source: 'proposal_role',
          parameter: 'rapporteur',
          per_requested_offering: false,
          lead_only: true,
          min: 1,
          max: 1,
        },
        notifications: [
          {
            trigger: 'step_started',
            recipient: 'responsible_role',
            proposal_role: null,
            notified_proposal_roles: [],
            days_before: null,
            enabled: true,
            actors: ['proposal_role_lead:rapporteur'],
          },
          {
            trigger: 'step_completed',
            recipient: 'applicant',
            proposal_role: null,
            notified_proposal_roles: [],
            days_before: null,
            enabled: false,
            actors: ['applicant'],
          },
        ],
      },
      [
        cell('applicant', {
          reads_outputs: flag(true, [
            stepRef('report', 'release_to_applicant'),
          ]),
        }),
        cell('proposal_role_lead:rapporteur', {
          completes: flag(true, [
            stepRef('report', 'completer'),
            stepRef('report', 'contributors_lead_only'),
          ]),
          notified: {
            value: true,
            triggers: [{ trigger: 'step_started', days_before: null }],
            because: [],
          },
        }),
      ],
    ),
  ],
  notifications: {
    flags: [
      {
        code: 'internal_step_named_to_applicant',
        kind: 'leak_risk',
        severity: 'warning',
        step: 'report',
        trigger: 'step_completed',
        recipient: 'applicant',
        message: 'The mail to the applicant names this step.',
        because: [stepRef('report', 'applicant_visible')],
      },
    ],
    always_sent: [
      {
        task: 'notify_user_about_proposal_state_update',
        event: 'proposal_decided',
        audience: ['applicant'],
      },
    ],
  },
  schedule: {
    stages: [],
    total_days: 21,
    critical_path: ['technical'],
    steps_without_duration: [],
  },
  issues_structural: [],
} as unknown as WorkflowDescription;
