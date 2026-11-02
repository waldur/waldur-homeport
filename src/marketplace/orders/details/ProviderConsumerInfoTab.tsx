import { EnvelopeIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Offering, OrderDetails } from 'waldur-js-client';

import {
  BaseButton,
  PropertyCard,
  PropertyItem,
  PropertyList,
} from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { PermissionEnum } from '@/permissions/enums';
import { hasConsumerPermission } from '@/permissions/hasPermission';
import { propVal } from '@/property/propertyFields';
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
}: {
  order: OrderDetails;
  offering: Offering;
  refetch: () => void | Promise<void>;
}) => {
  const user = useUser();
  const { openDialog } = useModal();

  const canRespond = useMemo(() => {
    return (
      order.state === 'pending-provider' &&
      order.provider_message &&
      offering?.plugin_options?.enable_provider_consumer_messaging &&
      hasConsumerPermission(user, {
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
    <div className="flex flex-col gap-5">
      <PropertyCard
        title={translate('Provider message')}
        actions={
          canRespond ? (
            <BaseButton
              label={translate('Respond')}
              onClick={openRespondDialog}
              iconNode={<EnvelopeIcon weight="bold" />}
              variant="primary"
              size="lg"
            />
          ) : undefined
        }
      >
        <PropertyList detailsMode>
          {order.provider_message && (
            <PropertyItem
              label={translate('Message')}
              value={propVal.richText(order.provider_message, {
                format: 'html',
              })}
            />
          )}
          {order.provider_message_url && (
            <PropertyItem
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
            <PropertyItem
              label={translate('Attachment')}
              value={propVal.file(order.provider_message_attachment, {
                fileName: translate('PDF file'),
                text: translate('Download PDF'),
              })}
            />
          )}
        </PropertyList>
      </PropertyCard>

      {(order.consumer_message || order.consumer_message_attachment) && (
        <PropertyCard title={translate('Customer response')}>
          <PropertyList detailsMode>
            {order.consumer_message && (
              <PropertyItem
                label={translate('Message')}
                value={propVal.richText(order.consumer_message, {
                  format: 'html',
                })}
              />
            )}
            {order.consumer_message_attachment && (
              <PropertyItem
                label={translate('Attachment')}
                value={propVal.file(order.consumer_message_attachment, {
                  fileName: translate('PDF file'),
                  text: translate('Download PDF'),
                })}
              />
            )}
          </PropertyList>
        </PropertyCard>
      )}
    </div>
  );
};
