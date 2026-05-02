import { CheckIcon, ProhibitInsetIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { marketplaceOfferingUsersUpdateRestricted } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const RestrictOfferingUserButton: FC<{
  row: any;
  refetch;
}> = (props) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceOfferingUsersUpdateRestricted({
        path: { uuid: props.row.uuid },
        body: {
          is_restricted: !props.row.is_restricted,
        },
      }),
    successMessage: translate('Restriction status has been updated.'),
    errorMessage: translate('Unable to update the restriction status.'),
    refetch: props.refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to update the restriction status of this user?',
      ),
    },
  });

  return (
    <ActionItem
      action={mutate}
      title={
        props.row.is_restricted
          ? translate('Unrestrict')
          : translate('Restrict')
      }
      iconNode={
        props.row.is_restricted ? (
          <CheckIcon weight="bold" />
        ) : (
          <ProhibitInsetIcon weight="bold" />
        )
      }
      className="text-danger"
      iconColor="danger"
      disabled={isPending}
    />
  );
};
