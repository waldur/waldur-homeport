import { FC } from 'react';

import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';

/**
 * Says whose view of the proposal the page is, where the tab alone would
 * not: the applicant's page read by someone off the applicant team, and an
 * offering team's own view.
 */
export const ProposalViewNotice: FC<{
  proposal: Proposal;
  /** The applicant's view, read by someone off the applicant team. */
  preview: boolean;
  /** The provider whose offering team's view this is. */
  providerUuid?: string;
}> = ({ proposal, preview, providerUuid }) => {
  if (preview) {
    return (
      <AlertItem
        type="floating"
        variant="info"
        // No margin: it sits in the page body's column, whose gap spaces it.
        className="bg-primary"
        data-testid="applicant-preview-notice"
        title={translate('Applicant view')}
        body={translate(
          'How this page reads to the applicant, as far as your role lets you read it. Your own work on the proposal is on its own tab.',
        )}
      />
    );
  }
  if (providerUuid) {
    const provider = proposal.offering_team_providers?.find(
      (item) => item.uuid === providerUuid,
    );
    return (
      <p className="text-tertiary mb-4" data-testid="offering-team-notice">
        {provider
          ? translate(
              'You are viewing this proposal as {provider}’s offering team: what it asks of your offerings, the steps your team works on, and how the proposal is progressing.',
              { provider: provider.name },
            )
          : translate(
              'You are viewing this proposal as an offering team: what it asks of your offerings, the steps your team works on, and how the proposal is progressing.',
            )}
      </p>
    );
  }
  return null;
};
