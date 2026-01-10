import { XIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Field, FormSection } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';
import { CompactActionButton } from '@waldur/table/CompactActionButton';

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
          <CompactActionButton
            variant="text-danger"
            action={() => props.onRemove(props.index)}
            iconNode={<XIcon weight="bold" />}
          />
        </td>
      </tr>
    </FormSection>
  );
};
