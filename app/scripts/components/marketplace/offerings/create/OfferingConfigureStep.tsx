import * as React from 'react';
import { FieldArray } from 'redux-form';

import { FormContainer, SelectField } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';
import { Category } from '@waldur/marketplace/types';

import { OfferingAttributes } from '../attributes/OfferingAttributes';
import { OfferingOptions } from '../option/OfferingOptions';
import { OfferingPlans } from '../plan/OfferingPlans';

interface OfferingConfigureStepProps extends TranslateProps {
  submitting: boolean;
  showOptions: boolean;
  offeringTypes: Option[];
  categories: Category[];
  category?: Category;
}

export const OfferingConfigureStep = (props: OfferingConfigureStepProps) => (
  <>
    <FormContainer
      submitting={props.submitting}
      labelClass="col-sm-3"
      controlClass="col-sm-9"
      clearOnUnmount={false}>
      <SelectField
        name="type"
        label={props.translate('Type')}
        required={true}
        options={props.offeringTypes}
        clearable={false}
      />
      <SelectField
        name="category"
        label={props.translate('Category')}
        options={props.categories}
        required={true}
        labelKey="title"
        valueKey="url"
        clearable={false}
      />
    </FormContainer>
    {props.category && <OfferingAttributes {...props}/>}
    <FieldArray name="plans" component={OfferingPlans} />
    {props.showOptions && <FieldArray name="options" component={OfferingOptions}/>}
  </>
);
