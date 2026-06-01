import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { NumberGroup } from '@/form';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { WizardModal, WizardStepProps } from '@/wizard';

import { OpenStackDiscoveryFormValues } from '../types';

export const LimitsStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<OpenStackDiscoveryFormValues>();
  const offering = props.data?.offering;
  const showSnapshotLimit =
    offering?.plugin_options?.storage_mode === 'dynamic';

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
      <h4 className="mb-4">{translate('Limits')}</h4>
      <p className="text-muted mb-6">
        {translate(
          'Configure resource limits and plugin options. All fields are optional.',
        )}
      </p>
      <NumberGroup
        name="default_internal_network_mtu"
        label={translate('Default internal network MTU')}
        description={translate(
          'MTU value for internal networks. Valid range: 68–9000. Leave empty to use the cloud default.',
        )}
      />
      {showSnapshotLimit && (
        <NumberGroup
          name="snapshot_size_limit_gb"
          min={0}
          unit="GB"
          placeholder={translate('No limit')}
          label={translate('Snapshot size limit')}
          description={translate(
            'Additional space in GB to apply to storage quota to be used by snapshots. Leave empty for no limit.',
          )}
        />
      )}
      <NumberGroup
        name="max_instances"
        min={0}
        placeholder={translate('No limit')}
        label={translate('Maximum number of instances in a single tenant')}
        description={translate('Leave empty for no limit.')}
      />
      <NumberGroup
        name="max_volumes"
        min={0}
        placeholder={translate('No limit')}
        label={translate('Maximum number of volumes in a single tenant')}
        description={translate('Leave empty for no limit.')}
        spaceless
      />
    </WizardModal>
  );
};
