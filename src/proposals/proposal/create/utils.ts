import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  CallResourceTemplate,
  Proposal,
  proposalProposalsResourcesDestroy,
  proposalProposalsResourcesSet,
  RequestedResource,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { reviewerAssignmentBlocker } from '@/proposals/assignments/reviewerAssignment';
import { Call } from '@/proposals/types';
import { invalidateProposalCanSubmit } from '@/proposals/useProposalCanSubmit';
import {
  callWorkflowStepsKey,
  fetchCallWorkflowSteps,
} from '@/proposals/workflow/queries';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

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
        let success;
        let error;
        const sendRequests = async (promises) => {
          const results = await Promise.allSettled(promises);
          results.forEach((res) => {
            if (res.status === 'rejected') {
              // The first failure is the cause; later ones tend to follow it.
              error = error ?? res.reason;
            } else {
              success = true;
            }
          });
        };
        // Removals finish before any addition is sent: a single-selection call
        // refuses a second template while the replaced one is still there.
        await sendRequests(
          removedSelections.map((resource) =>
            proposalProposalsResourcesDestroy({
              path: { uuid: proposal.uuid, obj_uuid: resource.uuid },
            }),
          ),
        );
        // In single mode a failed removal would only make the addition fail
        // too, and hide why behind the backend's "remove the current one
        // first". Elsewhere additions do not depend on removals.
        if (!error || call.resource_template_selection_mode !== 'single') {
          await sendRequests(
            newSelections.map((resource) =>
              proposalProposalsResourcesSet({
                path: { uuid: proposal.uuid },
                body: { call_resource_template_uuid: resource.uuid },
              }),
            ),
          );
        }
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
        // Here rather than where the list reloads: that also fires on mount,
        // refetching the whole proposal for a verdict the page already has.
        invalidateProposalCanSubmit(queryClient, proposal.uuid);
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

/**
 * Whether the user may assign reviewers to the proposal's call, and if so why
 * not to this proposal now (``reviewerAssignmentBlocker``), or null when they
 * can. Shared by the proposal row, the detail view and the call's selection,
 * so the three agree.
 */
export const useReviewerAssignment = (
  proposal: Proposal,
): { canManage: boolean; blocker: string | null } => {
  const user = useUser();
  // A boolean, not hasPermission's bare result: an undefined `enabled` is
  // React Query's default, true, and asked for the steps on everyone's behalf.
  const canManage = Boolean(
    hasPermission(user, {
      permission: PermissionEnum.MANAGE_PROPOSAL_REVIEW,
      scopeId: proposal.call_uuid,
      callOrganizerId: proposal.call_managing_organisation_uuid,
    }),
  );
  // The proposal names its step by key; the call's steps say who completes
  // it. The list is shared with the proposal list's step column, so a queue
  // of proposals costs one fetch per call.
  const { data: callSteps } = useQuery({
    queryKey: callWorkflowStepsKey(proposal.call_uuid),
    queryFn: () => fetchCallWorkflowSteps(proposal.call_uuid),
    staleTime: 5 * 60 * 1000,
    enabled: canManage && Boolean(proposal.workflow_step),
    // The permission above is checked client-side; a viewer the backend
    // does not let read the call's steps falls back to the default review
    // steps instead of leaving the page.
    retry: false,
    meta: { skipGlobalErrorRedirect: true },
  });
  return {
    canManage,
    blocker: canManage ? reviewerAssignmentBlocker(proposal, callSteps) : null,
  };
};

/** Whether a reviewer may be assigned to the proposal right now. */
export const useCanCreateReview = (proposal: Proposal): boolean => {
  const { canManage, blocker } = useReviewerAssignment(proposal);
  return canManage && !blocker;
};
