import classNames from 'classnames';
import { FC, useMemo, useState } from 'react';
import { Table } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import {
  CustomComponentInputProps,
  FilterOptions,
  SelectDialogFieldChoice,
  SelectDialogFieldColumn,
} from '@waldur/form/types';

import './ChoicesTable.scss';
import { ChoicesTableFilter } from './ChoicesTableFilter';

interface PureChoicesTableProps {
  enableSelect?: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
}

interface ChoicesTableProps extends PureChoicesTableProps {
  filterOptions?: FilterOptions;
}

export const PureChoicesTable: FC<ChoicesTableProps> = ({
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
                  <Tip id={choice.uuid} label={choice.disabledReason}>
                    <i className="fa fa-ban" />
                  </Tip>
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

export const ChoicesTable: FC<ChoicesTableProps> = (props) => {
  const [filter, setFilter] = useState<string>();

  const choices = useMemo(() => {
    if (props.filterOptions && filter) {
      return props.choices.filter(
        (choice) => choice[props.filterOptions.name] === filter,
      );
    }
    return props.choices;
  }, [props.choices]);

  return (
    <>
      {props.filterOptions && (
        <ChoicesTableFilter
          filterOptions={props.filterOptions}
          input={{ onChange: setFilter, value: filter }}
          wrapperClassName="btn-group mb-1"
        />
      )}
      <PureChoicesTable
        columns={props.columns}
        choices={choices}
        input={props.input}
      />
    </>
  );
};
