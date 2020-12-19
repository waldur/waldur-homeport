import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { FormContainer, SelectField } from '@waldur/form';
import { TranslateProps } from '@waldur/i18n';
import { Category } from '@waldur/marketplace/types';

import { OfferingAttributes } from '../attributes/OfferingAttributes';

interface DescriptionStepProps extends TranslateProps {
  categories: Category[];
  category?: Category;
  onCategoryChange(): void;
}

export const DescriptionStep: FunctionComponent<DescriptionStepProps> = (
  props,
) => (
  <>
    <FormContainer
      submitting={false}
      labelClass="col-sm-2"
      controlClass="col-sm-8"
      clearOnUnmount={false}
    >
      <SelectField
        name="category"
        label={props.translate('Category')}
        options={props.categories}
        required={true}
        getOptionValue={(option) => option.url}
        getOptionLabel={(option) => option.title}
        isClearable={false}
        validate={required}
        onChange={props.onCategoryChange}
      />
    </FormContainer>
    {props.category && (
      <OfferingAttributes
        sections={props.category.sections}
        labelCols={2}
        controlCols={8}
      />
    )}
  </>
);
