import { DownloadSimpleIcon, EnvelopeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OrderDetails } from 'waldur-js-client';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { lazyComponent } from '@waldur/core/lazyComponent';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ActionButton } from '@waldur/table/ActionButton';
import { getUser } from '@waldur/workspace/selectors';

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
  const user = useSelector(getUser);
  const dispatch = useDispatch();

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
    dispatch(
      openModalDialog(SetConsumerInfoDialog, {
        resolve: { order, refetch },
        size: 'lg',
      }),
    );
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
