import { debounce } from 'lodash-es';
import { useCallback, useState } from 'react';
import { Field, useForm } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { BoxNumberField } from '@/form/BoxNumberField';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';
import { Offering } from '@/marketplace/types';
import { FlavorTable } from '@/openstack/openstack-instance/deploy/FlavorTable';
import { FormAbstractVolumeFields } from '@/openstack/openstack-instance/deploy/FormAbstractVolumeFields';
import { VStepperFormStepCard } from '@/wizard';

import { LonghornWorkerWarning } from './LonghornWorkerWarning';

export const ManagedFormNodesStep = (props: FormStepProps) => {
  const { attributes = {} } = useOrderFormData();
  const form = useForm();
  const openstackOffering: Offering = attributes.openstack_offering;

  const [query, setQuery] = useState('');

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(value);
      form.change('attributes.worker_nodes_flavor', null);
    }, 1000),
    [form],
  );

  return (
    <VStepperFormStepCard
      title={translate('Worker nodes hardware configuration')}
      id={props.id}
      disabled={!openstackOffering || props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        <div className="ms-auto">
          <FilterBox
            type="search"
            placeholder={translate('Search')}
            onChange={(e) => applyQuery(e.target.value)}
          />
        </div>
      }
    >
      <div className="mb-2 border-bottom">
        <FormGroup label={translate('Number of nodes')} required={true}>
          <Field
            name="attributes.worker_nodes_count"
            component={BoxNumberField}
            min={1}
            validate={required}
            parse={parseIntField}
            format={formatIntField}
          />
        </FormGroup>
      </div>
      {openstackOffering ? (
        <>
          <div className="mb-2 border-bottom">
            <FlavorTable
              offering={openstackOffering}
              query={query}
              fieldName="attributes.worker_nodes_flavor"
            />
            <LonghornWorkerWarning />
          </div>
          <div className="mt-4">
            <FormAbstractVolumeFields
              {...props}
              offering={openstackOffering}
              typeTitle={translate('Data volume type')}
              sizeTitle={translate('Data volume size (GB)')}
              helpText={translate('Detachable and resizable data disk')}
              typeField="attributes.worker_nodes_data_volume_type_name"
              sizeField="attributes.worker_nodes_data_volume_size"
              hideQuotas
            />
          </div>
        </>
      ) : null}
    </VStepperFormStepCard>
  );
};
