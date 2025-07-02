import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceCustomerServiceAccountsRotateApiKey,
  marketplaceProjectServiceAccountsRotateApiKey,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { ServiceAccountsProps } from './type';

const ServiceAccountShowInfoDialog = lazyComponent(() =>
  import('./ServiceAccountShowInfoDialog').then((module) => ({
    default: module.ServiceAccountShowInfoDialog,
  })),
);

export const ServiceAccountRotateApiKeyAction: FC<
  ServiceAccountsProps & { row; refetch }
> = ({ context, row }) => {
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Rotate API key'),
          translate(
            'You are about to rotate API key for {username} service account. Are you sure you want to proceed?',
            { username: <strong>{row.username}</strong> },
            formatJsxTemplate,
          ),
          { positiveButton: translate('Yes') },
        );
      } catch {
        return;
      }
      try {
        const api =
          context === 'customer'
            ? marketplaceCustomerServiceAccountsRotateApiKey
            : marketplaceProjectServiceAccountsRotateApiKey;
        const response = await api({ path: { uuid: row.uuid } });
        dispatch(showSuccess(translate('API key rotated successfully')));
        // Open a dialog to show the new API key
        dispatch(
          openModalDialog(ServiceAccountShowInfoDialog, {
            resolve: {
              username: response.data.username,
              token: response.data.token,
              expiresAt: response.data.expires_at,
            },
          }),
        );
      } catch (e) {
        dispatch(
          showErrorResponse(
            e,
            translate('Unable to rotate API key for service account.'),
          ),
        );
      }
    },
  });

  return (
    <ActionItem
      action={mutate}
      title={translate('Rotate API key')}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
    />
  );
};
