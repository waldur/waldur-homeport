import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field, useFormState } from 'react-final-form';

import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import { OpenStackDiscoveryFormValues } from '../types';

export const ProvisioningStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<OpenStackDiscoveryFormValues>();

  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={false}
        label={translate('Continue')}
        onClick={() => props.handleSubmit()}
        type="button"
        iconNode={<CaretRightIcon weight="bold" />}
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Provisioning Configuration')}</h4>
      <p className="text-muted mb-6">
        {translate(
          'Configure flavor filtering, console access, network, and operational settings. All fields are optional.',
        )}
      </p>

      <h5 className="mb-3">{translate('Flavor & Volume Filtering')}</h5>

      <FormGroup
        label={translate('Flavor exclude regex')}
        description={translate(
          'Flavors matching this regex expression will not be pulled from the backend.',
        )}
      >
        <Field name="flavor_exclude_regex" component={StringField as any} />
      </FormGroup>

      <FormGroup
        label={translate('Blacklisted volume types')}
        description={translate(
          'List of comma-separated volume types which should not be possible to select when creating VM/Volume.',
        )}
      >
        <Field name="volume_type_blacklist" component={StringField as any} />
      </FormGroup>

      <h5 className="mb-3 mt-6">{translate('Console Access')}</h5>

      <FormGroup
        label={translate('Console type')}
        description={translate(
          'Type of console access protocol used by OpenStack (novnc, xvpvnc, spice-html5, rdp-html5, serial)',
        )}
      >
        <Field
          name="console_type"
          component={StringField as any}
          placeholder="novnc"
        />
      </FormGroup>

      <FormGroup
        label={translate('Console domain override')}
        description={translate(
          'A client-accessible domain name override in case OpenStack is returning an internal domain. Leave empty to use the domain returned by OpenStack.',
        )}
      >
        <Field name="console_domain_override" component={StringField as any} />
      </FormGroup>

      <h5 className="mb-3 mt-6">{translate('Network')}</h5>

      <FormGroup
        label={translate('Default DNS servers')}
        description={translate(
          'Default value for new subnets DNS name servers. Should be defined as list.',
        )}
      >
        <Field
          name="dns_nameservers"
          component={CommaSeparatedListField as any}
        />
      </FormGroup>

      <FormGroup>
        <Field
          name="create_ha_routers"
          component={AwesomeCheckboxField as any}
          label={translate('Create highly available Neutron routers')}
        />
      </FormGroup>

      <h5 className="mb-3 mt-6">{translate('Operations')}</h5>

      <FormGroup>
        <Field
          name="live_resize_of_volumes_enabled"
          component={AwesomeCheckboxField as any}
          label={translate('Allow live volume resize')}
        />
      </FormGroup>

      <FormGroup
        label={translate('Max concurrent provision (instances)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for instances. Leave empty for unlimited.',
        )}
      >
        <Field
          name="max_concurrent_provision_instance"
          component={NumberField as any}
          min={0}
          placeholder={translate('Unlimited')}
        />
      </FormGroup>

      <FormGroup
        label={translate('Max concurrent provision (volumes)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for volumes. Leave empty for unlimited.',
        )}
      >
        <Field
          name="max_concurrent_provision_volume"
          component={NumberField as any}
          min={0}
          placeholder={translate('Unlimited')}
        />
      </FormGroup>

      <FormGroup
        label={translate('Max concurrent provision (snapshots)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for snapshots. Leave empty for unlimited.',
        )}
        spaceless
      >
        <Field
          name="max_concurrent_provision_snapshot"
          component={NumberField as any}
          min={0}
          placeholder={translate('Unlimited')}
        />
      </FormGroup>
    </WizardModal>
  );
};
