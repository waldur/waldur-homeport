import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { Field, FormSection } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

interface OwnProps {
  index: number;
  variable: string;
  onRemove(index: number): void;
}

export const EnvironmentVariablePanel: FunctionComponent<OwnProps> = (
  props,
) => {
  return (
    <FormSection name={props.variable}>
      <tr className="border-bottom">
        <td>
          <Field
            name="name"
            component={InputField}
            placeholder={translate('Key')}
            className=""
          />
        </td>
        <td>
          <Field
            name="value"
            component={InputField}
            placeholder={translate('Value')}
            className=""
          />
        </td>
        <td>
          <Button
            variant="icon"
            size="sm"
            className="btn-active-color-danger"
            onClick={() => props.onRemove(props.index)}
          >
            <i className="fa fa-times fs-6" />
          </Button>
        </td>
      </tr>
    </FormSection>
  );
};
