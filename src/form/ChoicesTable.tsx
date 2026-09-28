import { ProhibitIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Table } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import {
  CustomComponentInputProps,
  SelectDialogFieldChoice,
  SelectDialogFieldColumn,
} from '@/form/types';

import './ChoicesTable.scss';

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
  <div className="table-responsive choices-table">
    <Table bsPrefix="table">
      <thead>
        <tr>
          {enableSelect && <th />}
          {props.columns.map((column, index) => (
            <th key={index} className={column.headerClass}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.choices.map((choice) => (
          <tr
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
            className={classNames({ 'selectable-row': enableSelect })}
          >
            {enableSelect && (
              <td>
                {choice.disabled ? (
                  <Tooltip label={choice.disabledReason}>
                    <ProhibitIcon weight="bold" />
                  </Tooltip>
                ) : (
                  <input
                    type="radio"
                    checked={
                      props.input.value &&
                      choice.uuid === props.input.value.uuid
                    }
                    name={props.input.name}
                    readOnly={true}
                  />
                )}
              </td>
            )}
            {props.columns.map((column, index) => (
              <td
                key={index}
                className={classNames({ disabled: choice.disabled })}
              >
                {column.filter
                  ? column.filter(choice[column.name])
                  : choice[column.name]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
);
