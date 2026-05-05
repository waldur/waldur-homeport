import { FC } from 'react';
import { CallCoiConfiguration } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
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
const COI_TYPE_INFO: Record<
  string,
  { label: string; description: string; severity: string }
> = {
  INST_SAME: {
    label: translate('Same institution'),
    description: translate(
      'Reviewer and proposal team member are at the same institution',
    ),
    severity: translate('High'),
  },
  FIN_DIRECT: {
    label: translate('Direct financial interest'),
    description: translate(
      'Reviewer has a direct financial stake in the proposal outcome',
    ),
    severity: translate('High'),
  },
  REL_FAMILY: {
    label: translate('Family relationship'),
    description: translate(
      'Reviewer has a family relationship with a proposal team member',
    ),
    severity: translate('High'),
  },
  ROLE_NAMED: {
    label: translate('Named on proposal'),
    description: translate('Reviewer is listed as personnel on the proposal'),
    severity: translate('High'),
  },
  COLLAB_ACTIVE: {
    label: translate('Active collaboration'),
    description: translate(
      'Reviewer has an ongoing collaboration with proposal team',
    ),
    severity: translate('High'),
  },
  REL_MENTOR: {
    label: translate('Mentor/mentee relationship'),
    description: translate(
      'Reviewer has a mentor or mentee relationship with proposal team',
    ),
    severity: translate('High'),
  },
  REL_SUPERVISOR: {
    label: translate('Supervisor relationship'),
    description: translate(
      'Reviewer has a supervisory relationship with proposal team',
    ),
    severity: translate('High'),
  },
  COAUTH_RECENT: {
    label: translate('Recent co-authorship'),
    description: translate(
      'Reviewer has recently co-authored papers with proposal team',
    ),
    severity: translate('Medium'),
  },
  INST_DEPT: {
    label: translate('Same department'),
    description: translate(
      'Reviewer is in the same department as proposal team member',
    ),
    severity: translate('Medium'),
  },
  INST_FORMER: {
    label: translate('Former institution'),
    description: translate(
      'Reviewer was previously at the same institution as proposal team',
    ),
    severity: translate('Medium'),
  },
  ROLE_CONF: {
    label: translate('Conference organizer'),
    description: translate(
      'Reviewer organized a conference with proposal team members',
    ),
    severity: translate('Medium'),
  },
  COLLAB_GRANT: {
    label: translate('Grant collaboration'),
    description: translate(
      'Reviewer has collaborated on grants with proposal team',
    ),
    severity: translate('Medium'),
  },
  REL_EDITORIAL: {
    label: translate('Editorial relationship'),
    description: translate(
      'Reviewer has an editorial relationship with proposal team',
    ),
    severity: translate('Medium'),
  },
  COMPET: {
    label: translate('Competitor'),
    description: translate(
      'Reviewer is a competitor to the proposal team or organization',
    ),
    severity: translate('Medium'),
  },
  COAUTH_OLD: {
    label: translate('Distant co-authorship'),
    description: translate(
      'Reviewer co-authored papers with proposal team in the past',
    ),
    severity: translate('Low'),
  },
  INST_CONSORT: {
    label: translate('Consortium membership'),
    description: translate(
      'Reviewer and proposal team are in the same consortium',
    ),
    severity: translate('Low'),
  },
  CONF_ATTEND: {
    label: translate('Conference participation'),
    description: translate(
      'Reviewer participated in same conference as proposal team',
    ),
    severity: translate('Low'),
  },
  SOC_MEMBER: {
    label: translate('Professional society'),
    description: translate(
      'Reviewer is in same professional society as proposal team',
    ),
    severity: translate('Low'),
  },
};

type BadgeVariant = 'danger' | 'warning' | 'info' | 'secondary';

const getHandlingLabel = (
  type: string,
  config: CallCoiConfiguration,
): { label: string; variant: BadgeVariant } => {
  if (config.recusal_required_types?.includes(type)) {
    return { label: translate('Recusal'), variant: 'danger' };
  }
  if (config.management_allowed_types?.includes(type)) {
    return { label: translate('Management'), variant: 'warning' };
  }
  if (config.disclosure_only_types?.includes(type)) {
    return { label: translate('Disclosure'), variant: 'info' };
  }
  return { label: translate('Not configured'), variant: 'secondary' };
};

const getSeverityVariant = (severity: string): BadgeVariant => {
  if (severity === translate('High')) return 'danger';
  if (severity === translate('Medium')) return 'warning';
  return 'info';
};

const generateDetectionFlowDiagram = (config: CallCoiConfiguration): string => {
  const namedEnabled = config.auto_detect_named_personnel;
  const instEnabled = config.auto_detect_institutional;
  const coauthEnabled = config.auto_detect_coauthorship;

  return `
flowchart TB
    subgraph trigger["Detection Trigger"]
        A[Call Manager triggers detection] --> B["API: POST /run-coi-detection/"]
        B --> C[Background job starts]
    end

    subgraph process["Detection Process"]
        C --> D{For each<br/>Reviewer x Proposal}

        D --> E[Named Personnel Check]
        D --> F[Institutional Check]
        D --> G[Co-authorship Check]

        E --> E1["${namedEnabled ? 'Enabled' : 'Disabled'}"]
        E1 --> E2["Checks: User ID, ORCID, Email, Name"]

        F --> F1["${instEnabled ? 'Enabled' : 'Disabled'}"]
        F1 --> F2["Lookback: ${config.institutional_lookback_years} years"]
        F1 --> F3["Same dept: ${config.include_same_department ? 'Yes' : 'No'}"]
        F1 --> F4["Same inst: ${config.include_same_institution ? 'Yes' : 'No'}"]

        G --> G1["${coauthEnabled ? 'Enabled' : 'Disabled'}"]
        G1 --> G2["Lookback: ${config.coauthorship_lookback_years} years"]
        G1 --> G3["Threshold: ${config.coauthorship_threshold_papers} papers"]
    end

    subgraph result["Conflict Record Created"]
        E2 & F4 & G3 --> H[ConflictOfInterest]
        H --> I{Handling based on type}
        I -->|Recusal types| J["Must Recuse"]
        I -->|Management types| K["Management Plan"]
        I -->|Disclosure types| L["Disclosure Only"]
    end

    style E1 fill:${namedEnabled ? '#d4edda' : '#f8d7da'},color:#000
    style F1 fill:${instEnabled ? '#d4edda' : '#f8d7da'},color:#000
    style G1 fill:${coauthEnabled ? '#d4edda' : '#f8d7da'},color:#000
`;
};

const generateStatusDiagram = (): string => `
stateDiagram-v2
    [*] --> PENDING: Detection creates conflict

    PENDING --> DISMISSED: Not a real conflict
    PENDING --> WAIVED: Real conflict, managed
    PENDING --> RECUSED: Real conflict, reviewer removed

    WAIVED --> RECUSED: If management plan fails

    note right of RECUSED: Reviewer cannot\\nreview this proposal
    note right of WAIVED: management_plan\\nfield populated
`;

export const COISummaryDialog: FC<Props> = ({ resolve }) => {
  const { config } = resolve;

  // Get all COI types
  const allTypes = Object.keys(COI_TYPE_INFO);

  return (
    <ModalDialog
      title={translate('How Conflict of Interest detection works')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-8">
        {/* Detection Flow */}
        <section>
          <h4 className="mb-4">{translate('Detection flow')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'When Conflict of Interest detection is triggered, the system checks each reviewer against each proposal for potential conflicts.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={generateDetectionFlowDiagram(config)}
              className="text-center"
            />
          </div>
        </section>

        {/* COI Types Reference */}
        <section>
          <h4 className="mb-4">{translate('Conflict types reference')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Each conflict type has a severity level and a handling action based on your configuration.',
            )}
          </p>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th>{translate('Type')}</th>
                  <th>{translate('Description')}</th>
                  <th>{translate('Severity')}</th>
                  <th>{translate('Handling')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {allTypes.map((type) => {
                  const info = COI_TYPE_INFO[type];
                  const handling = getHandlingLabel(type, config);
                  return (
                    <tr key={type}>
                      <td className="fw-bold text-gray-800">{info.label}</td>
                      <td>{info.description}</td>
                      <td>
                        <Badge
                          variant={getSeverityVariant(info.severity)}
                          pill
                          outline
                        >
                          {info.severity}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={handling.variant} pill outline>
                          {handling.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Status Workflow */}
        <section>
          <h4 className="mb-4">{translate('Status workflow')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'After a conflict of interest is detected, it progresses through these states based on reviewer and manager actions.',
            )}
          </p>
          <div className="border rounded p-4">
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
