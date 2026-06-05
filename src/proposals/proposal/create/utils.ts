import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  CallResourceTemplate,
  Proposal,
  proposalProposalsApprove,
  proposalProposalsReject,
  proposalProposalsResourcesDestroy,
  proposalProposalsResourcesSet,
  RequestedResource,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

export const useProposalDecisionActions = (
  proposal: Proposal,
  refetch: () => void,
) => {
  const user = useUser();

  const stateIsValid = ['submitted', 'in_review'].includes(proposal.state);

  const hasPermissionForDecision = hasPermission(user, {
    permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
    scopeId: proposal.call_uuid,
    callOrganizerId: proposal.call_managing_organisation_uuid,
  });

  const canPerformDecisionActions = stateIsValid && hasPermissionForDecision;

  const approveProposal = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsApprove({ path: { uuid: proposal.uuid } }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to approve the proposal {name} in state {state}?',
        {
          name: proposal.name,
          state: proposal.state,
        },
      ),
    },
    successMessage: translate('Proposal has been approved.'),
    errorMessage: translate('Unable to approve the proposal.'),
  });

  const rejectProposal = useManagedMutation<any, any, { input: string }>({
    mutationFn: (variables) =>
      proposalProposalsReject({
        path: { uuid: proposal.uuid },
        body: { allocation_comment: variables.input },
      }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to reject the proposal: {name}?', {
        name: proposal.name,
      }),
      options: {
        showInput: true,
        inputLabel: translate('Rejection reason'),
        inputPlaceholder: translate('Enter reason for rejection'),
        inputRequired: true,
      },
    },
    successMessage: translate('Proposal has been rejected.'),
    errorMessage: translate('Unable to reject the proposal.'),
  });

  return {
    canPerformDecisionActions,
    handleApproveProposal: () => approveProposal.mutate(),
    handleRejectProposal: () => rejectProposal.mutate(),
  };
};

export const useSubmitProposalResourcesFromTemplates = (
  proposal: Proposal,
  selectedTemplates: CallResourceTemplate[],
  initialResources: RequestedResource[],
  showMessages = true,
) => {
  const queryClient = useQueryClient();

  const { showErrorResponse, showSuccess } = useNotify();

  const newSelections = useMemo(() => {
    if (!selectedTemplates?.length) return [];
    return selectedTemplates.filter((template) => {
      return !initialResources.some(
        (req) => req.call_resource_template === template.url,
      );
    });
  }, [selectedTemplates, initialResources]);

  const removedSelections = useMemo(() => {
    if (!initialResources?.length) return [];
    return initialResources.filter((req) => {
      return !selectedTemplates.some(
        (template) => template.url === req.call_resource_template,
      );
    });
  }, [selectedTemplates, initialResources]);

  const { mutate: saveSelections, isPending } = useMutation({
    mutationFn: async () => {
      const call = queryClient.getQueryData<Call>([
        'publicCall',
        proposal.call_uuid,
      ]);

      if (!call?.resource_templates?.length) return;

      try {
        const addPromises = newSelections.map((resource) => {
          return proposalProposalsResourcesSet({
            path: { uuid: proposal.uuid },
            body: { call_resource_template_uuid: resource.uuid },
          });
        });
        const removePromises = removedSelections.map((resource) => {
          return proposalProposalsResourcesDestroy({
            path: { uuid: proposal.uuid, obj_uuid: resource.uuid },
          });
        });
        let success;
        let error;
        const sendRequests = async (promises) => {
          await Promise.allSettled(promises).then((results) => {
            results.forEach((res) => {
              if (res.status === 'rejected') {
                error = res.reason;
              } else if (res.status === 'fulfilled') {
                success = true;
              }
            });
          });
        };
        await sendRequests(removePromises);
        await sendRequests(addPromises);
        if (showMessages) {
          if (success) {
            showSuccess(translate('Resource requests has been updated.'));
          }
          if (error) {
            showErrorResponse(error, translate('Something went wrong'));
          }
        }
        // Refresh table
        queryClient.invalidateQueries({
          queryKey: ['table', 'ProposalResourcesList'],
        });
        // Refresh the proposal's resource list so the Resource requests step's
        // completion (resources_init) updates without a page reload.
        queryClient.invalidateQueries({
          queryKey: ['proposalResources', proposal.uuid],
        });
      } catch (error) {
        if (showMessages)
          showErrorResponse(error, translate('Something went wrong'));
      }
    },
  });

  return {
    save: saveSelections,
    newCount: newSelections?.length ?? 0,
    removedCount: removedSelections?.length ?? 0,
    isPending,
  };
};

export const CreateManualAssignmentDialog = lazyComponent(() =>
  import('@/proposals/assignments/CreateManualAssignmentDialog').then(
    (module) => ({ default: module.CreateManualAssignmentDialog }),
  ),
);

// Shared so the row-action and detail-view "Create review" affordances stay
// in lockstep on eligibility (state window + reviewer-management permission).
export const useCanCreateReview = (proposal: Proposal): boolean => {
  const user = useUser();
  return (
    ['submitted', 'in_review'].includes(proposal.state) &&
    hasPermission(user, {
      permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    })
  );
};
