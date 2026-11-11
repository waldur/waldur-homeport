import { ProhibitIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import {
  Radio,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from 'waldur-ui';

import {
  CustomComponentInputProps,
  SelectDialogFieldChoice,
  SelectDialogFieldColumn,
} from '@/form/types';
import { translate } from '@/i18n';

interface ChoicesTableProps {
  enableSelect?: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
}

export const ChoicesTable: FC<ChoicesTableProps> = ({
  enableSelect = true,
  ...props
}) => (
  <div className="max-h-[300px]! overflow-y-scroll!">
    <Table>
      <TableHeader>
        <TableRow>
          {enableSelect && <TableHead />}
          {props.columns.map((column, index) => (
            <TableHead key={index} className={column.headerClass}>
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.choices.map((choice) => (
          <TableRow
            key={choice.uuid}
            onKeyUp={(e) => {
              if (e.nativeEvent.keyCode === 13) {
                return props.input.onChange(choice);
              }
            }}
            onClick={() => {
              if (!choice.disabled) {
                return props.input.onChange(choice);
              }
            }}
            className={classNames({ 'cursor-pointer': enableSelect })}
          >
            {enableSelect && (
              <TableCell>
                {choice.disabled ? (
                  <Tooltip label={choice.disabledReason}>
                    <ProhibitIcon weight="bold" />
                  </Tooltip>
                ) : (
                  <Radio
                    aria-label={translate('Select row')}
                    size="sm"
                    checked={
                      props.input.value &&
                      choice.uuid === props.input.value.uuid
                    }
                    name={props.input.name}
                    readOnly={true}
                  />
                )}
              </TableCell>
            )}
            {props.columns.map((column, index) => (
              <TableCell
                key={index}
                className={classNames({ disabled: choice.disabled })}
              >
                {column.filter
                  ? column.filter(choice[column.name])
                  : choice[column.name]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);
