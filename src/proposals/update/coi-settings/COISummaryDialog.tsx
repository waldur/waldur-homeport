import { FC } from 'react';
import {
  CallCoiConfiguration,
  CoiSeverityLevel,
  CoiTypeEnum,
} from 'waldur-js-client';

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { MermaidChart } from '@/core/MermaidChart';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

interface Props {
  resolve: {
    config: CallCoiConfiguration;
  };
}

// COI type labels for display
const COI_TYPE_INFO: Partial<
  Record<
    CoiTypeEnum,
    { label: string; description: string; severity: CoiSeverityLevel }
  >
> = {
  INST_SAME: {
    label: translate('Same institution'),
    description: translate(
      'Reviewer and proposal team member are at the same institution',
    ),
    severity: 'real',
  },
  FIN_DIRECT: {
    label: translate('Direct financial interest'),
    description: translate(
      'Reviewer has a direct financial stake in the proposal outcome',
    ),
    severity: 'real',
  },
  REL_FAMILY: {
    label: translate('Family relationship'),
    description: translate(
      'Reviewer has a family relationship with a proposal team member',
    ),
    severity: 'real',
  },
  ROLE_NAMED: {
    label: translate('Named on proposal'),
    description: translate('Reviewer is listed as personnel on the proposal'),
    severity: 'real',
  },
  COLLAB_ACTIVE: {
    label: translate('Active collaboration'),
    description: translate(
      'Reviewer has an ongoing collaboration with proposal team',
    ),
    severity: 'real',
  },
  REL_MENTOR: {
    label: translate('Mentor/mentee relationship'),
    description: translate(
      'Reviewer has a mentor or mentee relationship with proposal team',
    ),
    severity: 'real',
  },
  REL_SUPERVISOR: {
    label: translate('Supervisor relationship'),
    description: translate(
      'Reviewer has a supervisory relationship with proposal team',
    ),
    severity: 'real',
  },
  COAUTH_RECENT: {
    label: translate('Recent co-authorship'),
    description: translate(
      'Reviewer has recently co-authored papers with proposal team',
    ),
    severity: 'apparent',
  },
  INST_DEPT: {
    label: translate('Same department'),
    description: translate(
      'Reviewer is in the same department as proposal team member',
    ),
    severity: 'apparent',
  },
  INST_FORMER: {
    label: translate('Former institution'),
    description: translate(
      'Reviewer was previously at the same institution as proposal team',
    ),
    severity: 'apparent',
  },
  ROLE_CONF: {
    label: translate('Conference organizer'),
    description: translate(
      'Reviewer organized a conference with proposal team members',
    ),
    severity: 'apparent',
  },
  COLLAB_GRANT: {
    label: translate('Grant collaboration'),
    description: translate(
      'Reviewer has collaborated on grants with proposal team',
    ),
    severity: 'apparent',
  },
  REL_EDITORIAL: {
    label: translate('Editorial relationship'),
    description: translate(
      'Reviewer has an editorial relationship with proposal team',
    ),
    severity: 'apparent',
  },
  COMPET: {
    label: translate('Competitor'),
    description: translate(
      'Reviewer is a competitor to the proposal team or organization',
    ),
    severity: 'apparent',
  },
  COAUTH_OLD: {
    label: translate('Distant co-authorship'),
    description: translate(
      'Reviewer co-authored papers with proposal team in the past',
    ),
    severity: 'potential',
  },
  INST_CONSORT: {
    label: translate('Consortium membership'),
    description: translate(
      'Reviewer and proposal team are in the same consortium',
    ),
    severity: 'potential',
  },
  CONF_ATTEND: {
    label: translate('Conference participation'),
    description: translate(
      'Reviewer participated in same conference as proposal team',
    ),
    severity: 'potential',
  },
  SOC_MEMBER: {
    label: translate('Professional society'),
    description: translate(
      'Reviewer is in same professional society as proposal team',
    ),
    severity: 'potential',
  },
};

type BadgeVariant = 'danger' | 'warning' | 'info' | 'neutral';

const getHandlingLabel = (
  type: CoiTypeEnum,
  config: CallCoiConfiguration,
): { label: string; variant: BadgeVariant } => {
  const includesType = (types: readonly string[] | undefined) =>
    Boolean(types?.includes(type));
  if (includesType(config.recusal_required_types)) {
    return { label: translate('Recusal'), variant: 'danger' };
  }
  if (includesType(config.management_allowed_types)) {
    return { label: translate('Management'), variant: 'warning' };
  }
  if (includesType(config.disclosure_only_types)) {
    return { label: translate('Disclosure'), variant: 'info' };
  }
  return { label: translate('Not configured'), variant: 'neutral' };
};

// The same labels and colors as the Severity column of the conflicts table.
const getSeverityLabel = (severity: CoiSeverityLevel): string => {
  if (severity === 'real') return translate('Real');
  if (severity === 'apparent') return translate('Apparent');
  return translate('Potential');
};

const getSeverityVariant = (severity: CoiSeverityLevel): BadgeVariant => {
  if (severity === 'real') return 'danger';
  if (severity === 'apparent') return 'warning';
  return 'info';
};

const generateDetectionFlowDiagram = (config: CallCoiConfiguration): string => {
  const namedEnabled = config.auto_detect_named_personnel;
  const instEnabled =
    config.auto_detect_institutional &&
    (config.include_same_institution || config.include_same_department);
  const coauthEnabled = config.auto_detect_coauthorship;

  return `
flowchart TB
    subgraph trigger["Detection Trigger"]
        A[Call manager starts detection] --> B["Reviewer pool → COI →<br/>Detect conflicts"]
        B --> C[Background job starts]
    end

    subgraph process["Detection Process"]
        C --> D{For each accepted pool reviewer<br/>x proposal in the call}

        D --> E[Named Personnel Check]
        D --> F[Institutional Check]
        D --> G[Co-authorship Check]

        E --> E1["${namedEnabled ? 'Enabled' : 'Disabled'}"]
        E1 --> E2["Checks the applicant team: User account, Email, Name, Alternative names"]

        F --> F1["${instEnabled ? 'Enabled' : 'Disabled'}"]
        F1 --> F2["Compares affiliations with the applicant organization"]
        F2 --> F3["${config.include_same_institution ? `Current: Same institution<br/>Ended within ${config.institutional_lookback_years} years: Former institution` : 'Same institution: off'}<br/>${config.include_same_department ? 'Same department at the same organization: Same department' : 'Same department: off'}"]

        G --> G1["${coauthEnabled ? 'Enabled' : 'Disabled'}"]
        G1 --> G2["Publications from the last ${config.coauthorship_lookback_years} years<br/>At least ${config.coauthorship_threshold_papers} shared papers"]
        G2 --> G3["Published this or last year: Recent co-authorship<br/>Older: Distant co-authorship"]
    end

    subgraph result["Conflict Recorded"]
        E2 & F3 & G3 --> H["New conflict, status Pending"]
        H --> I[Call manager dismisses, waives or recuses]
    end

    style E1 fill:${namedEnabled ? 'var(--status-success-bg-strong)' : 'var(--status-danger-bg-strong)'},color:var(--text-primary)
    style F1 fill:${instEnabled ? 'var(--status-success-bg-strong)' : 'var(--status-danger-bg-strong)'},color:var(--text-primary)
    style G1 fill:${coauthEnabled ? 'var(--status-success-bg-strong)' : 'var(--status-danger-bg-strong)'},color:var(--text-primary)
`;
};

const generateStatusDiagram = (): string => `
stateDiagram-v2
    [*] --> Pending: Detected or declared

    Pending --> Dismissed: Not a real conflict
    Pending --> Waived: Real conflict, managed
    Pending --> Recused: Real conflict, reviewer removed

    note right of Recused: Reviewer is removed\\nfrom this proposal
    note right of Waived: Management plan\\nrequired
`;

export const COISummaryDialog: FC<Props> = ({ resolve }) => {
  const { config } = resolve;

  // Get all COI types
  const allTypes = Object.keys(COI_TYPE_INFO) as CoiTypeEnum[];

  return (
    <ModalDialog
      title={translate('How Conflict of Interest detection works')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="flex flex-col gap-6">
        {/* Detection Flow */}
        <section>
          <h4 className="mb-3">{translate('Detection flow')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Detection checks each reviewer who accepted the pool invitation against each proposal in the call. A call manager starts it with the "Detect conflicts" button on the COI tab of the reviewer pool; the button is offered only when automated conflict of interest detection is turned on for the platform. The list of conflicts is updated when the run finishes. A run adds only conflicts that are not recorded yet.',
            )}
          </p>
          <p className="text-quaternary mb-3">
            {translate(
              "Institutional detection runs when Auto-detect institutional is on. Detect same institution compares the reviewer's affiliations with the applicant organization; Detect same department compares the departments the reviewer and the proposal's team members list in their reviewer profiles. Named-personnel and co-authorship checks compare the reviewer with the proposal's applicant team.",
            )}
          </p>
          <div className="border border-secondary rounded-lg p-3">
            <MermaidChart
              code={generateDetectionFlowDiagram(config)}
              className="text-center"
            />
          </div>
        </section>

        {/* COI Types Reference */}
        <section>
          <h4 className="mb-3">{translate('Conflict types reference')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Detection finds Named on proposal, Same institution, Former institution, Same department, Recent co-authorship and Distant co-authorship. A reviewer can declare a conflict of any type when accepting a pool invitation through the API. A type the call handles gets the severity its handling sets; otherwise the type’s typical severity, shown in the table.',
            )}
          </p>
          <p className="text-quaternary mb-3">
            {translate(
              'Handling shows the Type handling rules of this call. They set the severity a conflict is recorded with, and a type requiring recusal cannot be waived. Every conflict still waits as pending for a call manager to decide.',
            )}
          </p>
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Type')}</TableHead>
                <TableHead>{translate('Description')}</TableHead>
                <TableHead>{translate('Typical severity')}</TableHead>
                <TableHead>{translate('Handling')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allTypes.map((type) => {
                const info = COI_TYPE_INFO[type];
                const handling = getHandlingLabel(type, config);
                return (
                  <TableRow key={type}>
                    <TableCell className="font-medium text-primary">
                      {info.label}
                    </TableCell>
                    <TableCell className="text-tertiary">
                      {info.description}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getSeverityVariant(info.severity)}
                        shape="pill"
                        tone="outline"
                      >
                        {getSeverityLabel(info.severity)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={handling.variant}
                        shape="pill"
                        tone="outline"
                      >
                        {handling.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </section>

        {/* Status Workflow */}
        <section>
          <h4 className="mb-3">{translate('Status workflow')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Every conflict, detected or declared, starts as Pending. A call manager then dismisses it, waives it with a management plan, or recuses the reviewer.',
            )}
          </p>
          <ul className="text-quaternary mb-3">
            <li>
              {translate(
                'Pending and Recused conflicts block assigning the reviewer to the proposal. Dismissing or waiving lifts the block.',
              )}
            </li>
            <li>
              {translate(
                'Recusing blocks open assignments, rejects reviews in progress and revokes any evaluator role the reviewer holds on the proposal.',
              )}
            </li>
            <li>
              {translate(
                'Separately, a workflow step with Conflict of interest confirmation asks evaluators to confirm the Conflict-of-interest declaration before they start.',
              )}
            </li>
          </ul>
          <div className="border border-secondary rounded-lg p-3">
            <MermaidChart
              code={generateStatusDiagram()}
              className="text-center"
            />
          </div>
        </section>
      </div>
    </ModalDialog>
  );
};
