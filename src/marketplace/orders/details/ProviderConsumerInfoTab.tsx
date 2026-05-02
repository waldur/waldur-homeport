import { DownloadSimpleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { OrderDetails } from 'waldur-js-client';

import { FormattedHtml } from '@/core/FormattedHtml';
import { lazyComponent } from '@/core/lazyComponent';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ActionButton } from '@/table/ActionButton';
import { useUser } from '@/workspace/hooks';

const SetConsumerInfoDialog = lazyComponent(() =>
  import('../actions/SetConsumerInfoDialog').then((module) => ({
    default: module.SetConsumerInfoDialog,
  })),
);

interface ProviderConsumerInfoTabProps {
  order: OrderDetails;
  offering?: any;
  refetch?(): void | Promise<void>;
}

export const ProviderConsumerInfoTab: FC<ProviderConsumerInfoTabProps> = ({
  order,
  offering,
  refetch,
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const canRespond = useMemo(() => {
    return (
      order.state === 'pending-provider' &&
      order.provider_message &&
      offering?.plugin_options?.['enable_provider_consumer_messaging'] &&
      hasPermission(user, {
        permission: PermissionEnum.SET_CONSUMER_ORDER_INFO,
        customerId: order.customer_uuid,
        projectId: order.project_uuid,
      })
    );
  }, [order, offering, user]);

  const openRespondDialog = () => {
    openDialog(SetConsumerInfoDialog, {
      resolve: { order, refetch },
      size: 'lg',
    });
  };

  return (
    <div className="d-flex flex-column gap-6">
      <FormTable.Card
        title={translate('Provider message')}
        actions={
          canRespond ? (
            <ActionButton
              title={translate('Respond')}
              action={openRespondDialog}
              iconNode={<EnvelopeIcon weight="bold" />}
              variant="primary"
            />
          ) : undefined
        }
      >
        <FormTable detailsMode>
          {order.provider_message && (
            <FormTable.Item
              label={translate('Message')}
              value={<FormattedHtml html={order.provider_message} />}
            />
          )}
          {order.provider_message_url && (
            <FormTable.Item
              label={translate('URL')}
              value={
                <a
                  href={order.provider_message_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {order.provider_message_url}
                </a>
              }
            />
          )}
          {order.provider_message_attachment && (
            <FormTable.Item
              label={translate('Attachment')}
              value={
                <a
                  href={order.provider_message_attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <DownloadSimpleIcon weight="bold" className="me-1" />
                  {translate('Download PDF')}
                </a>
              }
            />
          )}
        </FormTable>
      </FormTable.Card>

      {(order.consumer_message || order.consumer_message_attachment) && (
        <FormTable.Card title={translate('Customer response')}>
          <FormTable detailsMode>
            {order.consumer_message && (
              <FormTable.Item
                label={translate('Message')}
                value={<FormattedHtml html={order.consumer_message} />}
              />
            )}
            {order.consumer_message_attachment && (
              <FormTable.Item
                label={translate('Attachment')}
                value={
                  <a
                    href={order.consumer_message_attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DownloadSimpleIcon weight="bold" className="me-1" />
                    {translate('Download PDF')}
                  </a>
                }
              />
            )}
          </FormTable>
        </FormTable.Card>
      )}
    </div>
  );
};
