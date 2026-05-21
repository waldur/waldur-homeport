import { debounce } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-final-form';
import { OpenStackFlavor, OpenStackImage } from 'waldur-js-client';

import { FilterBox } from '@/form/FilterBox';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';

import { calculateSystemVolumeSize } from '../utils';

import { FlavorTable } from './FlavorTable';
import { FormAbstractVolumeFields } from './FormAbstractVolumeFields';

export const FormHardwareConfigurationStep = (props: FormStepProps) => {
  const [query, setQuery] = useState('');
  const form = useForm();

  const applyQuery = useCallback(
    debounce((value) => {
      setQuery(value);
      form.change('attributes.flavor', null);
    }, 1000),
    [form],
  );

  const formData = useOrderFormData();

  const image = formData.attributes?.image as OpenStackImage;

  const flavor = formData.attributes?.flavor as OpenStackFlavor;

  const minSystemVolumeSize = useMemo(() => {
    const minSize = calculateSystemVolumeSize({
      image,
      flavor,
      system_volume_size: 0,
    });
    return minSize || 0;
  }, [image, flavor]);

  return (
    <VStepperFormStepCard
      title={translate('Hardware configuration')}
      id={props.id}
      disabled={props.disabled}
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
      <FlavorTable
        offering={props.offering}
        fieldName="attributes.flavor"
        query={query}
      />
      <div className="border-bottom my-5">
        <FormAbstractVolumeFields
          {...props}
          typeTitle={translate('System volume type')}
          sizeTitle={translate('System volume size (GB)')}
          helpText={translate('Non-detachable and non-resizable boot disk')}
          typeField="attributes.system_volume_type"
          sizeField="attributes.system_volume_size"
          optional={false}
          minSize={minSystemVolumeSize}
        />
      </div>

      <FormAbstractVolumeFields
        {...props}
        typeTitle={translate('Data volume type')}
        sizeTitle={translate('Data volume size (GB)')}
        helpText={translate('Detachable and resizable data disk')}
        typeField="attributes.data_volume_type"
        sizeField="attributes.data_volume_size"
        optional={true}
      />
    </VStepperFormStepCard>
  );
};
