import {
  CalculatorIcon,
  SparkleIcon,
  UserPlusIcon,
} from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback } from 'react';
import {
  proposalProtectedCallsComputeAffinities,
  proposalProtectedCallsGenerateAssignments,
} from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { automatedMatchingEnabled } from '@/reviewer/reviewerSettings';
import { useNotify } from '@/store/notify';

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('./CreateManualAssignmentDialog').then((module) => ({
    default: module.CreateManualAssignmentDialog,
  })),
);

interface CreateAssignmentDropdownProps {
  call: Call;
  refetch: () => void;
}

export const CreateAssignmentDropdown: FC<CreateAssignmentDropdownProps> = ({
  call,
  refetch,
}) => {
  const { openDialog } = useModal();
  const {
    showSuccess,
    showRedirectMessage: showWarning,
    showErrorResponse,
  } = useNotify();
  const queryClient = useQueryClient();

  const handleManualAssignment = useCallback(() => {
    openDialog(CreateManualAssignmentDialog, {
      resolve: { call, refetch },
    });
  }, [call, refetch, openDialog]);

  const generateMutation = useMutation({
    mutationFn: () =>
      proposalProtectedCallsGenerateAssignments({
        path: { uuid: call.uuid },
      }),
    onSuccess: (response) => {
      const data = response.data;
      const skipped = data.skipped_proposals ?? [];
      if (data.items_created || !skipped.length) {
        showSuccess(
          translate(
            'Generated {batches} batches with {items} assignment items for {proposals} proposals.',
            {
              batches: data.batches_created,
              items: data.items_created,
              proposals: data.proposals_processed,
            },
          ),
        );
      }
      // Each proposal left without a new reviewer, grouped by why: enough
      // reviewers already, or nobody eligible matching it closely enough.
      // The toast runs its message together, so each reason is a sentence.
      if (skipped.length) {
        const byReason = new Map<string, string[]>();
        skipped.forEach((row) => {
          const names = byReason.get(row.reason) ?? [];
          if (row.proposal_name) names.push(row.proposal_name);
          byReason.set(row.reason, names);
        });
        showWarning(
          skipped.length === 1
            ? translate('No reviewer added to 1 proposal')
            : translate('No reviewer added to {count} proposals', {
                count: skipped.length,
              }),
          [...byReason]
            .map(([reason, names]) =>
              names.length ? `${reason}: ${names.join(', ')}.` : `${reason}.`,
            )
            .join(' '),
        );
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: ['AssignmentBatchesTable'] });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to generate assignments.'));
    },
  });

  // Generate assignments ranks reviewers by the stored affinity scores, so
  // they are computed first, and again after the pool or proposals change.
  const computeMutation = useManagedMutation({
    mutationFn: () =>
      proposalProtectedCallsComputeAffinities({
        path: { uuid: call.uuid },
      }).then((response) => response.data),
    errorMessage: translate('Unable to compute affinities.'),
    closeModal: false,
    onSuccess: (data) => {
      if (data.computed_count) {
        showSuccess(
          translate('Computed {count} affinity scores.', {
            count: data.computed_count,
          }),
        );
      } else {
        // Nothing was computed: the call still lacks what scoring needs.
        showWarning(
          translate('No affinity scores computed'),
          translate(
            'The call needs proposals and accepted pool members with a reviewer profile.',
          ),
        );
      }
    },
  });

  return (
    <Menu>
      <Menu.TriggerButton variant="primary" size="lg">
        {translate('Create assignment')}
      </Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        <Menu.Item
          icon={<UserPlusIcon weight="bold" />}
          onSelect={handleManualAssignment}
        >
          {translate('Manual assignment')}
        </Menu.Item>
        {automatedMatchingEnabled() && (
          <Menu.Item
            icon={<CalculatorIcon weight="bold" />}
            onSelect={() => computeMutation.mutate(undefined)}
            disabled={computeMutation.isPending}
          >
            {translate('Compute affinities')}
          </Menu.Item>
        )}
        {automatedMatchingEnabled() && (
          <Menu.Item
            icon={<SparkleIcon weight="bold" />}
            onSelect={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {translate('Generate assignments')}
          </Menu.Item>
        )}
      </Menu.Content>
    </Menu>
  );
};
