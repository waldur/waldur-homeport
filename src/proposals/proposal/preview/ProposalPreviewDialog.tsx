import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import {
  proposalProposalsPreviewAs,
  proposalProposalsPreviewRolesList,
  ProposalPreviewRole,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { getErrorBody } from '@/core/ErrorMessageFormatter';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { DryRunPreview } from '@/proposals/workflow-description/dry-run/DryRunPreview';

interface ProposalPreviewDialogProps {
  resolve: { proposalUuid: string; proposalName: string };
}

const optionKey = (role: ProposalPreviewRole) =>
  `${role.role}:${role.offering ?? ''}`;

/**
 * The proposal page as a role of its call sees it now -- the applicant, a
 * reviewer, an offering's team, an evaluator role -- for the call team to
 * check before handing work on. The backend reads it as a synthetic person
 * given the role, and keeps nothing.
 */
export const ProposalPreviewDialog: FC<ProposalPreviewDialogProps> = ({
  resolve: { proposalUuid, proposalName },
}) => {
  const [chosen, setChosen] = useState<ProposalPreviewRole | null>(null);
  const roles = useQuery({
    queryKey: ['ProposalPreviewRoles', proposalUuid],
    queryFn: async () =>
      (
        await proposalProposalsPreviewRolesList({
          path: { uuid: proposalUuid },
        })
      ).data,
  });
  const preview = useQuery({
    queryKey: ['ProposalPreviewAs', proposalUuid, chosen && optionKey(chosen)],
    queryFn: async () =>
      (
        await proposalProposalsPreviewAs({
          path: { uuid: proposalUuid },
          body: { role: chosen.role, offering: chosen.offering },
        })
      ).data,
    enabled: Boolean(chosen),
    // A preview is a rolled-back run: read once per choice.
    staleTime: Infinity,
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });

  return (
    <ModalDialog
      title={translate('Preview {proposal} as…', { proposal: proposalName })}
      subtitle={translate(
        'The proposal page as a role of its call sees it now. It is read as an example person given the role: nobody real is viewed as, and nothing is saved or sent.',
      )}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {roles.isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="mb-5" data-testid="preview-role">
          <Select
            placeholder={translate('Choose a role…')}
            options={roles.data ?? []}
            getOptionValue={optionKey}
            getOptionLabel={(role: ProposalPreviewRole) => role.label}
            value={chosen}
            onChange={(role: ProposalPreviewRole) => setChosen(role)}
            isClearable={false}
          />
        </div>
      )}
      {preview.isFetching ? (
        <LoadingSpinner />
      ) : preview.error ? (
        <AlertItem
          type="floating"
          variant="error"
          title={translate('The preview could not be made')}
          body={
            getErrorBody(preview.error)?.detail ??
            translate('Try again in a moment.')
          }
        />
      ) : preview.data && chosen ? (
        <DryRunPreview
          view={preview.data}
          roleLabel={`${chosen.label} (${preview.data.described_as})`}
          page
        />
      ) : null}
    </ModalDialog>
  );
};
