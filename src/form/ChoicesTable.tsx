import classNames from 'classnames';
import React, { FunctionComponent } from 'react';
import { Table } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';

import './ChoicesTable.scss';
import { ChoicesTableFilter } from './ChoicesTableFilter';
import {
  SelectDialogFieldChoice,
  SelectDialogFieldColumn,
} from './SelectDialogField';

interface PureChoicesTableProps {
  enableSelect?: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
}

interface ChoicesTableProps extends PureChoicesTableProps {
  filterOptions?: FilterOptions;
}

export const PureChoicesTable: FunctionComponent<ChoicesTableProps> = (
  props,
) => (
  <div className="table-responsive choices-table">
    <Table bsPrefix="table">
      <thead>
        <tr>
          {props.enableSelect && <th />}
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
            className={classNames({ 'selectable-row': props.enableSelect })}
          >
            {props.enableSelect && (
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

PureChoicesTable.defaultProps = {
  enableSelect: true,
};

export class ChoicesTable extends React.Component<ChoicesTableProps> {
  state = {
    filter: undefined,
  };

  setFilter = (filter) => {
    this.setState({ filter });
  };

  getChoices = (choices) => {
    if (this.props.filterOptions && this.state.filter) {
      return choices.filter(
        (choice) => choice[this.props.filterOptions.name] === this.state.filter,
      );
    }
    return choices;
  };

  render() {
    const props = this.props;
    return (
      <>
        {props.filterOptions && (
          <ChoicesTableFilter
            filterOptions={props.filterOptions}
            input={{ onChange: this.setFilter, value: this.state.filter }}
            wrapperClassName="btn-group mb-1"
          />
        )}
        <PureChoicesTable
          columns={props.columns}
          choices={this.getChoices(props.choices)}
          input={props.input}
        />
      </>
    );
  }
}
