import * as React from 'react';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { LayoutWrapper } from './LayoutWrapper';

export const SummaryGroup = ({ layout, disabled }) => (
  <LayoutWrapper
    layout={layout}
    header={
      <>
        {translate('Title')}
        <span className="text-danger">*</span>
      </>
    }
    body={
      <Field
        name="summary"
        component={InputField}
        type="text"
        required={true}
        disabled={disabled}
      />
    }
  />
);
