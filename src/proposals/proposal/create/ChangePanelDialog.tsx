import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  proposalProposalsSetPanel,
  proposalProtectedCallsPanelsList,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { RadioGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal } from '@/proposals/types';
import { formatPanelDomains } from '@/proposals/update/panels/utils';

interface ChangePanelDialogProps {
  resolve: {
    proposal: Proposal;
    refetch?(): void;
  };
}

/**
 * Moves a proposal to another panel of its call. For the call's managers and
 * whoever completes the proposal's panel assignment step. The old panel's
 * chair goes with the move while they have not yet worked on the proposal;
 * anyone else holding a role taken from the panel refuses it. The applicant
 * team is never told the panel.
 */
export const ChangePanelDialog: FC<ChangePanelDialogProps> = ({
  resolve: { proposal, refetch },
}) => {
  const { data: panels = [], isLoading } = useQuery({
    queryKey: ['CallPanels', proposal.call_uuid],
    queryFn: () =>
      proposalProtectedCallsPanelsList({
        path: { uuid: proposal.call_uuid },
        query: { page_size: 100 },
      }).then(({ data }) => data),
  });
  const choices = useMemo(
    () =>
      panels.map((panel) => ({
        value: panel.uuid,
        label: panel.name,
        description: formatPanelDomains(panel) || undefined,
      })),
    [panels],
  );
  const change = useManagedMutation<any, any, { panel: string }>({
    mutationFn: (values) =>
      proposalProposalsSetPanel({
        path: { uuid: proposal.uuid },
        body: { panel: values.panel },
      }),
    successMessage: translate('The panel has been changed.'),
    errorMessage: translate('Unable to change the panel.'),
    refetch,
  });

  return (
    <Form<{ panel: string }>
      initialValues={{ panel: proposal.panel_uuid ?? undefined }}
      onSubmit={(values) => change.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid, pristine }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change panel')}
            subtitle={translate(
              "The chosen panel evaluates the proposal from now on. The old panel's chair, assigned by the workflow and not yet at work on the proposal, is replaced by the new panel's chair; anyone else holding a role taken from the panel must be revoked first. The change is recorded in the proposal's event log, which its applicant team does not read.",
            )}
            footer={
              <>
                <CloseDialogButton variant="tertiary" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid || pristine || isLoading}
                  label={translate('Change panel')}
                />
              </>
            }
          >
            <RadioGroup
              name="panel"
              label={translate('Panel')}
              choices={choices}
              validate={required}
              required
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
