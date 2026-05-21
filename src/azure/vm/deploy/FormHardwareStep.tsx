import { FormLabel } from 'react-bootstrap';

import {
  getImageLabel,
  getSizeLabel,
  loadImageOptions,
  loadSizeOptions,
} from '@/azure/vm/utils';
import { required } from '@/core/validators';
import { AsyncSelectField } from '@/form/AsyncSelectField';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { useOrderFormData } from '@/marketplace/deploy/selectors';
import { FormStepProps } from '@/marketplace/deploy/types';

export const FormHardwareStep = (props: FormStepProps) => {
  const { attributes = {} } = useOrderFormData();
  const location = attributes.location;
  const zone = attributes.availability_zone;

  return (
    <VStepperFormStepCard
      title={translate('Hardware configuration')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <div className="mb-7">
        <FormLabel className="required">{translate('Image')}</FormLabel>
        <AsyncSelectField
          key={location?.uuid}
          name="attributes.image"
          validate={required}
          loadOptions={(query, prevOptions, currentPage) =>
            location
              ? loadImageOptions(
                  props.offering.scope_uuid,
                  location.uuid,
                  query,
                  prevOptions,
                  currentPage,
                )
              : Promise.resolve({
                  options: [],
                  hasMore: false,
                  additional: { page: 1 },
                })
          }
          getOptionLabel={getImageLabel}
          isDisabled={!location}
          noOptionsMessage={() =>
            !location
              ? translate('Please select location first')
              : translate('No images found')
          }
        />
      </div>

      <div className="mb-7">
        <FormLabel className="required">{translate('Size')}</FormLabel>
        <AsyncSelectField
          key={`${location?.uuid}-${zone?.value}`}
          name="attributes.size"
          validate={required}
          isDisabled={!location || !zone}
          loadOptions={(query, prevOptions, currentPage) =>
            location && zone
              ? loadSizeOptions(
                  props.offering.scope_uuid,
                  location.uuid,
                  zone.value,
                  query,
                  prevOptions,
                  currentPage,
                )
              : Promise.resolve({
                  options: [],
                  hasMore: false,
                  additional: { page: 1 },
                })
          }
          getOptionLabel={getSizeLabel}
          noOptionsMessage={() =>
            !location || !zone
              ? translate('Please select location and availability zone first')
              : translate('No sizes found')
          }
        />
      </div>
    </VStepperFormStepCard>
  );
};
