import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { BaseButton } from 'waldur-ui';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

interface EnvironmentVariablePanelProps {
  index: number;
  variable: string;
  onRemove(index: number): void;
}

export const EnvironmentVariablePanel: FC<EnvironmentVariablePanelProps> = ({
  index,
  variable,
  onRemove,
}) => {
  return (
    <tr className="border-bottom">
      <td>
        <Field name={`${variable}.name`}>
          {({ input, meta }) => (
            <InputField
              input={input}
              meta={meta}
              placeholder={translate('Key')}
            />
          )}
        </Field>
      </td>
      <td>
        <Field name={`${variable}.value`}>
          {({ input, meta }) => (
            <InputField
              input={input}
              meta={meta}
              placeholder={translate('Value')}
            />
          )}
        </Field>
      </td>
      <td>
        <BaseButton
          variant="text-danger"
          onClick={() => onRemove(index)}
          iconNode={<XIcon weight="bold" />}
          size="sm"
        />
      </td>
    </tr>
  );
};
