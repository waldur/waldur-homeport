import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';

import { Resource } from '../types';

import { Field } from './Field';
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
    <Field
      label={translate('UUID')}
      value={props.resolve.resource.uuid}
      valueClass="ellipsis"
      helpText={translate('Unique ID of a resource within management plugin')}
      hasCopy
    />
    {props.resolve.resource.marketplace_resource_uuid && (
      <Field
        label={translate('Marketplace UUID')}
        value={props.resolve.resource.marketplace_resource_uuid}
        valueClass="ellipsis"
        helpText={translate('Unique ID of a resource created via Marketplace')}
        hasCopy
      />
    )}
    {!props.resolve.hideBackendId && (
      <Field
        label={translate('Backend ID')}
        value={props.resolve.resource.backend_id}
        valueClass="ellipsis"
        helpText={translate('Unique ID of a resource in a backend system')}
        hasCopy
      />
    )}
    {props.resolve.resource.resource_type === 'OpenStack.Tenant' && (
      <>
        <Field
          label={translate('Internal network ID')}
          value={
            (props.resolve.resource as OpenStackTenant).internal_network_id
          }
        />
        <Field
          label={translate('External network ID')}
          value={
            (props.resolve.resource as OpenStackTenant).external_network_id
          }
        />
      </>
    )}
  </ModalDialog>
);
