import { TrashIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC } from 'react';
import { proposalProposalsDestroy } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { usesCallVocabulary } from '@/proposals/presentation';

/**
 * A draft its managers no longer want: deleted outright, as the backend
 * allows only while the proposal is a draft. Once submitted, withdrawing it
 * is the way out instead.
 */
export const DeleteDraftAction: FC<{
  proposal: { uuid: string; name: string };
}> = ({ proposal }) => {
  const router = useRouter();
  const remove = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsDestroy({ path: { uuid: proposal.uuid } }),
    confirmation: {
      title: translate('Delete draft'),
      body: translate(
        'Delete the draft "{name}"? Everything it holds is lost; this cannot be undone.',
        { name: proposal.name },
      ),
    },
    successMessage: translate('Draft deleted.'),
    errorMessage: usesCallVocabulary()
      ? translate('Unable to delete the proposal.')
      : translate('Unable to delete the request.'),
    onSuccess: () => router.stateService.go('proposals-all-proposals'),
  });
  return (
    <BaseButton
      onClick={() => remove.mutate()}
      label={translate('Delete draft')}
      iconNode={<TrashIcon weight="bold" />}
      variant="text-danger"
      className="w-full mt-1.5"
      pending={remove.isPending}
      size="lg"
    />
  );
};
