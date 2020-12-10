import { createElement } from 'react';
import { FormSection } from 'redux-form';

export const ProviderFormBody = (props) => (
  <FormSection name="details">
    {props.type &&
      props.type.component &&
      createElement(props.type.component, props)}
  </FormSection>
);
