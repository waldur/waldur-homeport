import * as React from 'react';
import { Field } from 'redux-form';

import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { renderValidationWrapper } from '@waldur/form-react/FieldValidationWrapper';
import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const ImageGroup = props => (
  <CreateResourceFormGroup label={translate('Image')} required={true}>
    <Field
      name="attributes.image"
      validate={required}
      component={renderValidationWrapper(fieldProps => (
        <SelectDialogField
          id="image"
          columns={[
            {
              label: translate('Image name'),
              name: 'name',
            },
            {
              label: (
                <>
                  {translate('Min RAM')} <PriceTooltip />
                </>
              ),
              name: 'min_ram',
              filter: formatFilesize,
            },
            {
              label: translate('Min storage'),
              name: 'min_disk',
              filter: formatFilesize,
            },
          ]}
          choices={props.images}
          input={{
            name: fieldProps.input.name,
            value: fieldProps.input.value,
            onChange: value => {
              fieldProps.input.onChange(value);
              props.validateFlavor(value);
            },
          }}
        />
      ))}
    />
  </CreateResourceFormGroup>
);
