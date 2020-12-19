import { createElement, FunctionComponent } from 'react';
import { FormSection } from 'redux-form';

export const ProviderFormBody: FunctionComponent<any> = (props) => (
  <FormSection name="details">
    {props.type &&
      props.type.component &&
      createElement(props.type.component, props)}
  </FormSection>
);
