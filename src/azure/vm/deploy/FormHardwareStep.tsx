import { FormLabel } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';

import {
  getImageLabel,
  getSizeLabel,
  loadImageOptions,
  loadSizeOptions,
} from '@waldur/azure/vm/utils';
import { required } from '@waldur/core/validators';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';

export const FormHardwareStep = (props: FormStepProps) => {
  const location = useSelector((state) =>
    formValueSelector(ORDER_FORM_ID)(state, 'attributes.location'),
  );
  const zone = useSelector((state) =>
    formValueSelector(ORDER_FORM_ID)(state, 'attributes.availability_zone'),
  );

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
          required={true}
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
          required={true}
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
