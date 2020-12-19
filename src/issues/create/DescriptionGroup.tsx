import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { LayoutWrapper } from './LayoutWrapper';

export const DescriptionGroup: FunctionComponent<{ layout; disabled }> = ({
  layout,
  disabled,
}) => (
  <LayoutWrapper
    layout={layout}
    header={
      <>
        {translate('Description')}
        <span className="text-danger">*</span>
      </>
    }
    body={
      <Field
        name="description"
        component={InputField}
        componentClass="textarea"
        required={true}
        disabled={disabled}
      />
    }
  />
);
