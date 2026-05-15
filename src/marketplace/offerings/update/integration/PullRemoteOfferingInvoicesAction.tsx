import { FileTextIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { client } from 'waldur-js-client/client.gen';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

/** POST /api/remote-waldur-api/pull_offering_invoices/{uuid}/ — not yet in published waldur-js-client exports. */
const postPullOfferingInvoices = (uuid: string) =>
  client.post({
    url: '/api/remote-waldur-api/pull_offering_invoices/{uuid}/',
    path: { uuid },
  });

export const PullRemoteOfferingInvoicesAction: FC<{ offering: any }> = ({
  offering,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () => postPullOfferingInvoices(offering.uuid),
    successMessage: translate(
      'Offering invoices synchronization has been scheduled.',
    ),
    errorMessage: translate('Unable to synchronize offering invoices.'),
  });

  return (
    <ActionItem
      title={translate('Pull offering invoices')}
      action={mutate}
      iconNode={<FileTextIcon weight="bold" />}
      disabled={isPending}
    />
  );
};
