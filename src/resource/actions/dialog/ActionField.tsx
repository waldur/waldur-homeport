import { FunctionComponent } from 'react';

import { formatSnakeCase } from '@waldur/core/utils';
import { angular2react } from '@waldur/shims/angular2react';
import { react2angular } from '@waldur/shims/react2angular';

const PROPS = ['field', 'model', 'form', 'context'];

export const ActionField: FunctionComponent<{
  field;
  model;
  form;
  context;
}> = ({ field, model, form, context }) => {
  if (typeof field.component === 'function') {
    return (
      <field.component
        field={field}
        model={model}
        form={form}
        context={context}
      />
    );
  }
  const componentName = field.component
    ? formatSnakeCase(field.component)
    : `action-field-${field.type}`;
  const FieldComponent = angular2react<{
    field: any;
    model: any;
    form: any;
    context: any;
  }>(componentName, PROPS);
  return (
    <FieldComponent field={field} model={model} form={form} context={context} />
  );
};

export default react2angular(ActionField, PROPS as any);
