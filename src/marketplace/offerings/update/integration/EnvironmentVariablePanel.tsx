import { XIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Field } from 'react-final-form';

import { BaseButton, TableCell, TableRow } from 'waldur-ui';

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
    <TableRow>
      <TableCell>
        <Field name={`${variable}.name`}>
          {({ input, meta }) => (
            <InputField
              input={input}
              meta={meta}
              placeholder={translate('Key')}
            />
          )}
        </Field>
      </TableCell>
      <TableCell>
        <Field name={`${variable}.value`}>
          {({ input, meta }) => (
            <InputField
              input={input}
              meta={meta}
              placeholder={translate('Value')}
            />
          )}
        </Field>
      </TableCell>
      <TableCell>
        <BaseButton
          tooltip={translate('Remove')}
          variant="text-danger"
          onClick={() => onRemove(index)}
          iconNode={<XIcon weight="bold" />}
          size="sm"
        />
      </TableCell>
    </TableRow>
  );
};
