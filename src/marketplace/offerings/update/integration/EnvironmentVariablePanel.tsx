import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { CompactActionButton } from '@/table/CompactActionButton';

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
        <CompactActionButton
          variant="text-danger"
          action={() => onRemove(index)}
          iconNode={<XIcon weight="bold" />}
        />
      </td>
    </tr>
  );
};
