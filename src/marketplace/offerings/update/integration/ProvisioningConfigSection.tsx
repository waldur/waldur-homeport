import { get } from 'lodash';
import { FC } from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { NumberField, StringField, TextField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';
import { allowToUpdateService } from '@waldur/marketplace/common/registry';
import { TENANT_TYPE } from '@waldur/openstack/constants';
import {
  BASIC_OFFERING_TYPE,
  SUPPORT_OFFERING_TYPE,
} from '@waldur/support/constants';

import { EditLexisLinkIntegrationButton } from './EditLexisLinkIntegrationButton';
import { EditSchedulesButton } from './EditSchedulesButton';
import { FieldEditButton } from './FieldEditButton';
import { GoogleCalendarActions } from './GoogleCalendarActions';
import { RemoteActions } from './RemoteActions';
import { ScriptIntegrationSummary } from './ScriptIntegrationSummary';
import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const TITLE = translate('Provisioning configuration');

const openStackFields = [
  {
    label: translate('Availability zone'),
    description: translate(
      'Default availability zone for provisioned instances.',
    ),
    key: 'service_attributes.availability_zone',
    component: StringField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for instances',
    ),
    key: 'service_attributes.max_concurrent_provision_instance',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for volumes',
    ),
    key: 'service_attributes.max_concurrent_provision_volume',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for snapshots',
    ),
    key: 'service_attributes.max_concurrent_provision_snapshot',
    component: NumberField,
  },
  {
    label: translate('Flavor exclude regex'),
    description: translate(
      'Flavors matching this regex expression will not be pulled from the backend.',
    ),
    key: 'service_attributes.flavor_exclude_regex',
    component: StringField,
  },
  {
    label: translate('Blacklisted volume types'),
    description: translate(
      'List of coma-separated volume types which should not be possible to select when creating VM/Volume.',
    ),
    key: 'service_attributes.volume_type_blacklist',
    component: StringField,
  },
  {
    label: translate('Console type'),
    description: translate(
      'Type of console access protocol used by Openstack (novnc, xvpvnc, spice-html5, rdp-html5, serial)',
    ),
    key: 'service_attributes.console_type',
    component: StringField,
  },
  {
    label: translate('Console domain override'),
    description: translate(
      'A client-accessible domain name override in case Openstack is returning an internal domain',
    ),
    key: 'service_attributes.console_domain_override',
    component: StringField,
  },
];

export const ProvisioningConfigSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  if (
    ![
      SUPPORT_OFFERING_TYPE,
      BASIC_OFFERING_TYPE,
      TENANT_TYPE,
      OFFERING_TYPE_CUSTOM_SCRIPTS,
      OFFERING_TYPE_BOOKING,
    ].includes(props.offering.type) ||
    (props.offering.type === TENANT_TYPE &&
      !allowToUpdateService(props.offering.type))
  ) {
    return null;
  }

  if (props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
    return <ScriptIntegrationSummary {...props} />;
  }

  return (
    <FormTable.Card
      title={TITLE}
      actions={
        <>
          {props.offering.type !== OFFERING_TYPE_BOOKING &&
          isFeatureVisible(MarketplaceFeatures.lexis_links) ? (
            <EditLexisLinkIntegrationButton
              offering={props.offering}
              refetch={props.refetch}
            />
          ) : null}
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
        </>
      }
      className="card-bordered mb-7"
    >
      <FormTable>
        {[SUPPORT_OFFERING_TYPE, BASIC_OFFERING_TYPE].includes(
          props.offering.type,
        ) ? (
          <FormTable.Item
            label={translate('Confirmation notification template')}
            value={
              props.offering.secret_options?.template_confirmation_comment ||
              'N/A'
            }
            actions={
              <FieldEditButton
                title={TITLE}
                scope={props.offering}
                name="secret_options.template_confirmation_comment"
                callback={update}
                fieldComponent={TextField}
              />
            }
          />
        ) : props.offering.type === TENANT_TYPE ? (
          openStackFields.map((field) => (
            <FormTable.Item
              key={field.key}
              label={field.label}
              value={get(props.offering, field.key, 'N/A')}
              description={field.description}
              actions={
                <FieldEditButton
                  title={TITLE}
                  scope={props.offering}
                  name={field.key}
                  callback={update}
                  fieldComponent={field.component}
                />
              }
            />
          ))
        ) : null}
      </FormTable>
    </FormTable.Card>
  );
};
