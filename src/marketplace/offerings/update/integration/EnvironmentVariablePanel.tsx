import { XIcon } from '@phosphor-icons/react';
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
          />
        </td>
        <td>
          <Field
            name="value"
            component={InputField}
            placeholder={translate('Value')}
          />
        </td>
        <td>
          <Button
            variant="icon"
            size="sm"
            className="btn-active-color-danger"
            onClick={() => props.onRemove(props.index)}
          >
            <span className="svg-icon svg-icon-2">
              <XIcon weight="bold" />
            </span>
          </Button>
        </td>
      </tr>
    </FormSection>
  );
};
