import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@uirouter/react';
import { User, usersDestroy } from 'waldur-js-client';

import { Panel } from '@/core/Panel';
import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { isDescendantOf } from '@/navigation/useTabs';
import { RemovalActionButton } from '@/table/RemovalActionButton';

import { TermsOfService } from './TermsOfService';

export const UserDelete = ({ user }: { user: User }) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () => usersDestroy({ path: { uuid: user.uuid } }),
    successMessage: translate('User has been deleted.'),
    errorMessage: translate('Unable to delete user.'),
    onSuccess: () => {
      queryClient.setQueryData(['User', user.uuid], undefined);
      if (isDescendantOf('marketplace-provider', router.globals.current)) {
        router.stateService.go('marketplace-provider-users');
      } else {
        router.stateService.go('support-users');
      }
    },
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to delete {name}?',
        { name: <strong>{user.full_name}</strong> },
        formatJsxTemplate,
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <Panel
      title={translate('Delete account')}
      className="mb-5"
      cardBordered
      actions={
        <RemovalActionButton
          action={deleteMutation.mutate}
          disabled={deleteMutation.isPending}
          disabledReason={translate('Deletion in progress')}
          pending={deleteMutation.isPending}
          title={translate('Delete')}
        />
      }
    >
      <ul className="text-gray-500 mb-7">
        {user.agreement_date && (
          <li>
            <TermsOfService agreementDate={user.agreement_date} />
          </li>
        )}
        <li>{translate('Permanently delete user account.')}</li>
        <li>{translate('This action cannot be undone.')}</li>
      </ul>
    </Panel>
  );
};
