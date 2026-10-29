import { FC } from 'react';

import {
  AlertItem,
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

const generatePoolWorkflowDiagram = (): string => `
flowchart TB
    subgraph stage1["Stage 1: Pool Construction"]
        direction TB
        A[Call Manager] --> B{Find Reviewers}
        B -->|Discovery tab| C["Generate suggestions<br/>from proposals/keywords"]
        B -->|Direct invite| D["Invite by email"]

        C --> E["Review & confirm<br/>suggestions"]
        E --> F["Send pool invitation"]
        D --> F

        F --> G{Reviewer Response}
        G -->|Accept| H["Added to pool<br/>(status: accepted)"]
        G -->|Decline| I["Not in pool<br/>(status: declined)"]
        G -->|No response| J["Invitation expires<br/>(status: expired)"]
    end

    subgraph stage2["Stage 2: Proposal Assignment"]
        H --> K["Eligible for<br/>proposal assignments"]
        K --> L["Generate assignments<br/>(Assignments tab)"]
        L --> M["Reviewer receives<br/>specific proposals"]
    end

    style C fill:var(--status-info-bg-strong),color:var(--text-primary)
    style H fill:var(--status-success-bg-strong),color:var(--text-primary)
    style I fill:var(--status-danger-bg-strong),color:var(--text-primary)
`;

const generateInvitationStatusDiagram = (): string => `
stateDiagram-v2
    [*] --> pending: Invitation sent

    pending --> accepted: Reviewer accepts
    pending --> declined: Reviewer declines
    pending --> expired: Deadline passed

    accepted --> [*]: Pool member

    note right of pending: Awaiting response
    note right of accepted: Can receive assignments
    note right of declined: Will not participate
`;

const INVITATION_STATUSES = [
  {
    status: 'pending',
    label: translate('Pending'),
    description: translate(
      'Invitation sent, waiting for reviewer to respond. Check expiry date.',
    ),
    variant: 'warning' as const,
  },
  {
    status: 'accepted',
    label: translate('Accepted'),
    description: translate(
      'Reviewer accepted the invitation and is now a pool member. Can receive proposal assignments.',
    ),
    variant: 'success' as const,
  },
  {
    status: 'declined',
    label: translate('Declined'),
    description: translate(
      'Reviewer declined the invitation. They will not participate in this call.',
    ),
    variant: 'danger' as const,
  },
  {
    status: 'expired',
    label: translate('Expired'),
    description: translate(
      'Invitation expired without response. Consider re-inviting with a new deadline.',
    ),
    variant: 'secondary' as const,
  },
];

const POOL_TABS = [
  {
    tab: translate('Pool'),
    description: translate(
      'View all pool members and their invitation status. Track who has accepted and who is still pending.',
    ),
  },
  {
    tab: translate('Discovery'),
    description: translate(
      'Find potential reviewers using affinity matching. Generate suggestions based on call description, proposals, or custom keywords.',
    ),
  },
  {
    tab: translate('Assignments'),
    description: translate(
      'After pool is built, generate and send proposal assignments to accepted pool members.',
    ),
  },
  {
    tab: translate('COI'),
    description: translate(
      'Review detected conflicts of interest between pool members and proposals.',
    ),
  },
];

export const PoolSummaryDialog: FC = () => {
  return (
    <ModalDialog
      title={translate('How the Reviewer Pool Works')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="flex flex-col gap-6">
        {/* Overview */}
        <section>
          <AlertItem
            type="floating"
            variant="info"
            title={translate('Two-Stage Reviewer Workflow:')}
            body={translate(
              'The review process has two stages. Stage 1 (this section) builds the reviewer pool - inviting experts to participate in the call. Stage 2 assigns specific proposals to accepted pool members for review.',
            )}
          />
        </section>

        {/* Main Flow Diagram */}
        <section>
          <h4 className="mb-3">{translate('Pool construction workflow')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Build your reviewer pool by finding experts and inviting them to participate. Only accepted pool members can receive proposal assignments.',
            )}
          </p>
          <div className="border rounded p-3">
            <MermaidChart
              code={generatePoolWorkflowDiagram()}
              className="text-center"
            />
          </div>
        </section>

        {/* Invitation Status */}
        <section>
          <h4 className="mb-3">{translate('Invitation statuses')}</h4>
          <p className="text-quaternary mb-3">
            {translate('Pool invitations progress through these states:')}
          </p>
          <div className="border rounded p-3 mb-3">
            <MermaidChart
              code={generateInvitationStatusDiagram()}
              className="text-center"
            />
          </div>
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Status')}</TableHead>
                <TableHead>{translate('Description')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INVITATION_STATUSES.map((item) => (
                <TableRow key={item.status}>
                  <TableCell>
                    <Badge variant={item.variant} shape="pill" tone="outline">
                      {item.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-tertiary">
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Tab Overview */}
        <section>
          <h4 className="mb-3">{translate('Reviewer pool tabs')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              'Use these tabs to manage different aspects of the reviewer pool:',
            )}
          </p>
          <Table density="normal">
            <TableHeader>
              <TableRow>
                <TableHead>{translate('Tab')}</TableHead>
                <TableHead>{translate('Purpose')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {POOL_TABS.map((item) => (
                <TableRow key={item.tab}>
                  <TableCell className="font-medium text-primary">
                    {item.tab}
                  </TableCell>
                  <TableCell className="text-tertiary">
                    {item.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Finding Reviewers */}
        <section>
          <h4 className="mb-3">{translate('Finding reviewers')}</h4>
          <p className="text-quaternary mb-3">
            {translate('There are two ways to add reviewers to your pool:')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="card card-bordered h-full">
                <div className="card-body">
                  <h5 className="card-title">
                    {translate('Discovery (recommended)')}
                  </h5>
                  <p className="card-text text-quaternary">
                    {translate(
                      'Use the Discovery tab to automatically find reviewers whose expertise matches your call or proposals. The system analyzes reviewer profiles, publications, and expertise keywords to suggest the best matches.',
                    )}
                  </p>
                  <ul className="mb-0 small">
                    <li>{translate('Match against call description')}</li>
                    <li>{translate('Match against submitted proposals')}</li>
                    <li>{translate('Search by custom keywords')}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <div className="card card-bordered h-full">
                <div className="card-body">
                  <h5 className="card-title">{translate('Direct invite')}</h5>
                  <p className="card-text text-quaternary">
                    {translate(
                      'If you already know who you want to invite, use the "Invite by email" button to send invitations directly. The reviewer will receive an email with a link to accept or decline.',
                    )}
                  </p>
                  <ul className="mb-0 small">
                    <li>{translate('Invite known experts directly')}</li>
                    <li>{translate('Works even if not in system yet')}</li>
                    <li>{translate('Set workload limit per reviewer')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h4 className="mb-3">{translate('Tips')}</h4>
          <ul className="mb-0">
            <li>
              {translate(
                'Build your pool before proposals are submitted to give reviewers time to accept.',
              )}
            </li>
            <li>
              {translate(
                "Monitor pending invitations - follow up with reviewers who haven't responded.",
              )}
            </li>
            <li>
              {translate(
                'Use the Discovery tab to see affinity scores between reviewers and proposals.',
              )}
            </li>
            <li>
              {translate(
                'Check COI detection results before generating assignments.',
              )}
            </li>
          </ul>
        </section>
      </div>
    </ModalDialog>
  );
};
