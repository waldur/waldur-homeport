import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { marketplaceScriptSyncResource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { useNotify } from '@/store/notify';

import { ResourceAction } from './constants';

export const SyncResourceAction = ({ resource, ...rest }) => {
  const { showSuccess } = useNotify();

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceScriptSyncResource({
        body: {
          resource_uuid: resource.uuid,
        },
      }),
    onSuccess: (response) => {
      showSuccess(response.data['detail']);
    },
    errorMessage: translate('Unable to synchronise.'),
  });

  return resource.offering_type === OFFERING_TYPE_CUSTOM_SCRIPTS ? (
    <ActionItem
      title={translate('Synchronise')}
      action={mutate}
      disabled={isPending}
      {...rest}
      iconNode={<ArrowsClockwiseIcon weight="bold" />}
      actionId={ResourceAction.SYNCHRONIZE}
      resource={resource}
    />
  ) : null;
};
