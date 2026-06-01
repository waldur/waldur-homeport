import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import {
  StringGroup,
  BooleanGroup,
  NumberGroup,
  CommaSeparatedListGroup,
} from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

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
      <StringGroup
        name="flavor_exclude_regex"
        label={translate('Flavor exclude regex')}
        description={translate(
          'Flavors matching this regex expression will not be pulled from the backend.',
        )}
      />
      <StringGroup
        name="volume_type_blacklist"
        label={translate('Blacklisted volume types')}
        description={translate(
          'List of comma-separated volume types which should not be possible to select when creating VM/Volume.',
        )}
      />
      <h5 className="mb-3 mt-6">{translate('Console Access')}</h5>
      <StringGroup
        name="console_type"
        placeholder="novnc"
        label={translate('Console type')}
        description={translate(
          'Type of console access protocol used by OpenStack (novnc, xvpvnc, spice-html5, rdp-html5, serial)',
        )}
      />
      <StringGroup
        name="console_domain_override"
        label={translate('Console domain override')}
        description={translate(
          'A client-accessible domain name override in case OpenStack is returning an internal domain. Leave empty to use the domain returned by OpenStack.',
        )}
      />
      <h5 className="mb-3 mt-6">{translate('Network')}</h5>
      <CommaSeparatedListGroup
        label={translate('Default DNS servers')}
        description={translate(
          'Default value for new subnets DNS name servers. Should be defined as list.',
        )}
        name="dns_nameservers"
      />
      <BooleanGroup
        name="create_ha_routers"
        label={translate('Create highly available Neutron routers')}
      />
      <h5 className="mb-3 mt-6">{translate('Operations')}</h5>
      <BooleanGroup
        name="live_resize_of_volumes_enabled"
        label={translate('Allow live volume resize')}
      />
      <NumberGroup
        name="max_concurrent_provision_instance"
        min={0}
        placeholder={translate('Unlimited')}
        label={translate('Max concurrent provision (instances)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for instances. Leave empty for unlimited.',
        )}
      />
      <NumberGroup
        name="max_concurrent_provision_volume"
        min={0}
        placeholder={translate('Unlimited')}
        label={translate('Max concurrent provision (volumes)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for volumes. Leave empty for unlimited.',
        )}
      />
      <NumberGroup
        name="max_concurrent_provision_snapshot"
        min={0}
        placeholder={translate('Unlimited')}
        label={translate('Max concurrent provision (snapshots)')}
        description={translate(
          'Maximum parallel executions of provisioning operations for snapshots. Leave empty for unlimited.',
        )}
        spaceless
      />
    </WizardModal>
  );
};
