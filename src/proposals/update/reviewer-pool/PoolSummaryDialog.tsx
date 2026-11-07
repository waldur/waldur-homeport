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
  Card,
  CardContent,
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
        B -->|Discovery tab| C["Generate matches from call,<br/>proposals or keywords"]
        B -->|Direct invite| D["Invite by email"]

        C --> E["Confirm or reject<br/>suggestions"]
        E --> F["Send confirmed invitations"]
        D --> F2["Invitation email sent"]
        F --> F2

        F2 --> G{Reviewer Response}
        G -->|Accept| H["Added to pool<br/>(status: accepted)"]
        G -->|Decline| I["Not in pool<br/>(status: declined)"]
        G -->|No response| J["Invitation expires<br/>(status: expired)"]
        J -->|Resend invitation| F2
    end

    subgraph stage2["Stage 2: Proposal Assignment"]
        H --> K["Eligible for<br/>proposal assignments"]
        K --> L["Create assignment batches<br/>(Assignment batches tab)"]
        L --> M["Send batches;<br/>reviewer accepts or declines<br/>each proposal"]
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
    expired --> pending: Resend invitation
    pending --> accepted: Force accept
    declined --> accepted: Force accept
    expired --> accepted: Force accept

    accepted --> [*]: Pool member

    note right of pending: Awaiting response
    note right of accepted: Can receive assignments
    note right of declined: Cannot be sent again
`;

const INVITATION_STATUSES = [
  {
    status: 'pending',
    label: translate('Pending'),
    description: translate(
      'Invitation sent, waiting for the reviewer to respond before the expiry date. To accept, the reviewer signs in with the invited email address and publishes a reviewer profile.',
    ),
    variant: 'warning' as const,
  },
  {
    status: 'accepted',
    label: translate('Accepted'),
    description: translate(
      'Reviewer accepted the invitation and is now a pool member. Can receive proposal assignments while their account is active and in good standing.',
    ),
    variant: 'success' as const,
  },
  {
    status: 'declined',
    label: translate('Declined'),
    description: translate(
      'Reviewer declined the invitation. A declined invitation cannot be sent again.',
    ),
    variant: 'danger' as const,
  },
  {
    status: 'expired',
    label: translate('Expired'),
    description: translate(
      'Invitation expired without a response. The person who sent it is notified by email. Use "Resend invitation" to send it again with a new link and expiry date.',
    ),
    variant: 'neutral' as const,
  },
];

const POOL_TABS = [
  {
    tab: translate('Pool'),
    description: translate(
      'View all pool members, their invitation status, reviews, conflicts and open assignments. Resend invitations, copy invitation links, or force-accept an invitation.',
    ),
  },
  {
    tab: translate('Discovery'),
    description: translate(
      'Find potential reviewers using affinity matching. Generate matches based on the call description, proposals, or custom keywords, then confirm suggestions and send invitations.',
    ),
  },
  {
    tab: translate('Assignment batches'),
    description: translate(
      'After the pool is built, create assignment batches for accepted pool members and send them to the reviewers. In the "Create assignment" menu, use "Manual assignment", or "Compute affinities" and then "Generate assignments".',
    ),
  },
  {
    tab: translate('Reviewer capacity'),
    description: translate(
      'See how many open assignments each accepted pool member has and change the maximum number of proposals they can be assigned.',
    ),
  },
  {
    tab: translate('COI'),
    description: translate(
      'Review conflicts of interest between pool members and proposals, whether declared by reviewers or detected automatically. Use "Detect conflicts" to check every accepted pool member against every proposal. Dismiss, waive or recuse each pending conflict.',
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
              'The review process has two stages. Stage 1 builds the reviewer pool - inviting experts to participate in the call. Stage 2 assigns specific proposals to accepted pool members for review. Reviewers see the proposals only once they are assigned.',
            )}
          />
        </section>

        {/* Main Flow Diagram */}
        <section>
          <h4 className="mb-3">{translate('Pool construction workflow')}</h4>
          <p className="text-quaternary mb-3">
            {translate(
              "Build your reviewer pool by finding experts and inviting them to participate. Each invitation is emailed with a link to accept or decline, and stays open for the call's assignment response window (7 days by default). Only accepted pool members can receive proposal assignments.",
            )}
          </p>
          <div className="border border-secondary rounded-lg p-3">
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
          <div className="border border-secondary rounded-lg p-3 mb-3">
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
              <Card bordered className="h-full">
                <CardContent>
                  <h5>{translate('Discovery (recommended)')}</h5>
                  <p className="text-quaternary">
                    {translate(
                      'Use the Discovery tab to automatically find reviewers whose expertise matches your call or proposals. The system compares the expertise keywords, recent publications and biography of published reviewer profiles that are available for reviews to suggest the best matches.',
                    )}
                  </p>
                  <ul className="mb-0 small">
                    <li>{translate('Match against call description')}</li>
                    <li>{translate('Match against submitted proposals')}</li>
                    <li>{translate('Search by custom keywords')}</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card bordered className="h-full">
                <CardContent>
                  <h5>{translate('Direct invite')}</h5>
                  <p className="text-quaternary">
                    {translate(
                      'If you already know who you want to invite, use the "Invite by email" button to send invitations directly, with an optional message and a maximum number of assignments. The reviewer will receive an email with a link to accept or decline.',
                    )}
                  </p>
                  <ul className="mb-0 small">
                    <li>{translate('Invite known experts directly')}</li>
                    <li>
                      {translate(
                        'Works even if not in system yet - they sign up with the invited email',
                      )}
                    </li>
                    <li>
                      {translate(
                        'Maximum assignments is 5 unless you set another; it can be changed in the Reviewer capacity tab once accepted',
                      )}
                    </li>
                  </ul>
                </CardContent>
              </Card>
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
                "Monitor pending invitations - follow up with reviewers who haven't responded, or resend the invitation.",
              )}
            </li>
            <li>
              {translate(
                'Use the Discovery tab to see affinity scores between reviewers and proposals.',
              )}
            </li>
            <li>
              {translate(
                'Force accept only works for a reviewer with a reviewer profile, and requires a reason, which is recorded.',
              )}
            </li>
            <li>
              {translate(
                'Run "Detect conflicts" and resolve conflicts in the COI tab before generating assignments. A reviewer with a pending or recused conflict is not assigned that proposal.',
              )}
            </li>
          </ul>
        </section>
      </div>
    </ModalDialog>
  );
};
