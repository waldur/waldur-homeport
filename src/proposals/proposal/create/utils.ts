import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  CallResourceTemplate,
  Proposal,
  proposalProposalsApprove,
  proposalProposalsReject,
  proposalProposalsResourcesDestroy,
  proposalProposalsResourcesSet,
  RequestedResource,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { PROPOSAL_UPDATE_SUBMISSION_FORM_ID } from '@waldur/proposals/constants';
import { Call } from '@waldur/proposals/types';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';
import { fetchListStart } from '@waldur/table/actions';
import { useUser } from '@waldur/workspace/hooks';

export const useProposalDecisionActions = (
  proposal: Proposal,
  refetch: () => void,
) => {
  const dispatch = useDispatch();
  const user = useUser();

  const stateIsValid = ['submitted', 'in_review'].includes(proposal.state);

  const hasPermissionForDecision = hasPermission(user, {
    permission: PermissionEnum.APPROVE_AND_REJECT_PROPOSALS,
    scopeId: proposal.call_uuid,
    callOrganizerId: proposal.call_managing_organisation_uuid,
  });

  const canPerformDecisionActions = stateIsValid && hasPermissionForDecision;

  const handleApproveProposal = useCallback(async () => {
    await waitForConfirmation(
      dispatch,
      translate('Confirmation'),
      translate(
        'Are you sure you want to approve the proposal {name} in state {state}?',
        {
          name: proposal.name,
          state: proposal.state,
        },
      ),
    );
    try {
      await proposalProposalsApprove({ path: { uuid: proposal.uuid } });
      dispatch(showSuccess(translate('Proposal has been approved.')));
      refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to approve the proposal.')),
      );
    }
  }, [dispatch, proposal.uuid, proposal.name, proposal.state, refetch]);

  const handleRejectProposal = useCallback(async () => {
    try {
      const reason = await waitForConfirmation(
        dispatch,
        translate('Confirmation'),
        translate('Are you sure you want to reject the proposal: {name}?', {
          name: proposal.name,
        }),
        {
          showInput: true,
          inputLabel: translate('Rejection reason'),
          inputPlaceholder: translate('Enter reason for rejection'),
          inputRequired: true,
        },
      );

      await proposalProposalsReject({
        path: { uuid: proposal.uuid },
        body: { allocation_comment: reason },
      });

      dispatch(showSuccess(translate('Proposal has been rejected.')));
      refetch();
    } catch (error) {
      if (!error) return;
      dispatch(
        showErrorResponse(error, translate('Unable to reject the proposal.')),
      );
    }
  }, [dispatch, proposal.uuid, proposal.name, refetch]);

  return {
    canPerformDecisionActions,
    handleApproveProposal,
    handleRejectProposal,
  };
};

const proposalFormDataSelector = (state) =>
  (getFormValues(PROPOSAL_UPDATE_SUBMISSION_FORM_ID)(state) || {}) as any;

export const useSubmitProposalResourcesFromTemplates = (
  proposal: Proposal,
  showMessages = true,
) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const formData: {
    resources: CallResourceTemplate[];
    resources_init: RequestedResource[];
  } = useSelector(proposalFormDataSelector);

  const newSelections = useMemo(() => {
    if (!formData?.resources?.length) return [];
    return formData.resources.filter((resource) => {
      return !formData.resources_init.some(
        (req) => req.call_resource_template === resource.url,
      );
    });
  }, [formData]);
  const removedSelections = useMemo(() => {
    if (!formData?.resources_init?.length) return [];
    return formData.resources_init.filter((req) => {
      return !formData.resources.some(
        (resource) => resource.url === req.call_resource_template,
      );
    });
  }, [formData]);

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
            dispatch(
              showSuccess(translate('Resource requests has been updated.')),
            );
          }
          if (error) {
            dispatch(
              showErrorResponse(error, translate('Something went wrong')),
            );
          }
        }
        // Refresh table
        dispatch(fetchListStart('ProposalResourcesList'));
      } catch (error) {
        if (showMessages)
          dispatch(showErrorResponse(error, translate('Something went wrong')));
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
