import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { OpenStackTenant } from '@/openstack/openstack-tenant/types';

import { Resource } from '../types';

import { ResourceSummaryProps } from './types';

interface ResourceMetadataDialogProps<T extends Resource = any> {
  resolve: ResourceSummaryProps<T>;
}

export const ResourceMetadataDialog = <T extends Resource = any>(
  props: ResourceMetadataDialogProps<T>,
) => (
  <ModalDialog
    title={props.resolve.resource.name}
    footer={<CloseDialogButton label={translate('Close')} />}
  >
    <PropertyList variant="summary">
      <PropertyItem
        label={translate('UUID')}
        value={props.resolve.resource.uuid}
        valueClass="ellipsis"
        tooltip={translate('Unique ID of a resource within management plugin')}
        hasCopy
      />

      <PropertyItem
        label={translate('Marketplace UUID')}
        value={props.resolve.resource.marketplace_resource_uuid}
        valueClass="ellipsis"
        tooltip={translate('Unique ID of a resource created via Marketplace')}
        hasCopy
      />
      {!props.resolve.hideBackendId && (
        <PropertyItem
          label={translate('Backend ID')}
          value={props.resolve.resource.backend_id}
          valueClass="ellipsis"
          tooltip={translate('Unique ID of a resource in a backend system')}
          hasCopy
        />
      )}
      {props.resolve.resource.resource_type === 'OpenStack.Tenant' && (
        <>
          <PropertyItem
            label={translate('Internal network ID')}
            value={
              (props.resolve.resource as OpenStackTenant).internal_network_id
            }
          />

          <PropertyItem
            label={translate('External network ID')}
            value={
              (props.resolve.resource as OpenStackTenant).external_network_id
            }
          />
        </>
      )}
    </PropertyList>
  </ModalDialog>
);
