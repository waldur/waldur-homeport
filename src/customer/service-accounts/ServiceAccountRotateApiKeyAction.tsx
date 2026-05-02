import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import {
  marketplaceCustomerServiceAccountsRotateApiKey,
  marketplaceProjectServiceAccountsRotateApiKey,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

import { ServiceAccountsProps } from './type';

const ServiceAccountShowInfoDialog = lazyComponent(() =>
  import('./ServiceAccountShowInfoDialog').then((module) => ({
    default: module.ServiceAccountShowInfoDialog,
  })),
);

export const ServiceAccountRotateApiKeyAction: FC<
  ServiceAccountsProps & { row; refetch }
> = ({ context, row }) => {
  const { openDialog } = useModal();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const api =
        context === 'customer'
          ? marketplaceCustomerServiceAccountsRotateApiKey
          : marketplaceProjectServiceAccountsRotateApiKey;
      return api({ path: { uuid: row.uuid } });
    },
    confirmation: {
      title: translate('Rotate API key'),
      body: translate(
        'You are about to rotate API key for {username} service account. Are you sure you want to proceed?',
        { username: <strong>{row.username}</strong> },
        formatJsxTemplate,
      ),
      options: { positiveButton: translate('Yes') },
    },
    successMessage: translate('API key rotated successfully'),
    errorMessage: translate('Unable to rotate API key for service account.'),
    onSuccess: (response) => {
      openDialog(ServiceAccountShowInfoDialog, {
        resolve: {
          username: response.data.username,
          token: response.data.token,
          expiresAt: response.data.expires_at,
        },
      });
    },
  });

  return (
    <ActionItem
      action={mutate}
      disabled={isPending}
      title={translate('Rotate API key')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
