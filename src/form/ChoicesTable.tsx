import * as classNames from 'classnames';
import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { Tooltip } from '@waldur/core/Tooltip';
import { SelectDialogFieldColumn, SelectDialogFieldChoice } from '@waldur/form-react/types';
import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';

import './ChoicesTable.scss';

import { ChoicesTableFilter } from './ChoicesTableFilter';

interface PureChoicesTableProps {
  enableSelect?: boolean;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  input: CustomComponentInputProps;
}

interface ChoicesTableProps extends PureChoicesTableProps {
  filterOptions?: FilterOptions;
}

export const PureChoicesTable: React.SFC<PureChoicesTableProps> = (props: ChoicesTableProps) => (
  <div className="table-responsive choices-table">
    <Table bsClass="table">
      <thead>
        <tr>
          {props.enableSelect && <th/>}
          {props.columns.map((column, index) => (
            <th key={index} className={column.headerClass}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {props.choices.map(choice => (
          <tr
            key={choice.uuid}
            onKeyUp={e => {
              if (e.nativeEvent.keyCode === 13) {
                return props.input.onChange(choice.name);
              }
            }}
            onClick={() => {
              if (!choice.disabled) {
                return props.input.onChange(choice.name);
              }
            }}
            className={classNames({'selectable-row': props.enableSelect})}
          >
            {props.enableSelect &&
              <td>
                {
                  choice.disabled ?
                    <Tooltip
                      id={choice.uuid}
                      label={choice.disabledReason}
                    >
                      <i className="fa fa-ban" />
                    </Tooltip> :
                    <input
                      type="radio"
                      checked={choice.name === props.input.value}
                      name={props.input.name}
                      readOnly={true}/>
                }
              </td>
            }
            {props.columns.map((column, index) => (
              <td key={index} className={classNames({disabled: choice.disabled})}>
                {choice[column.name]}
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

  setFilter = filter => {
    this.setState({filter});
  }

  getChoices = choices => {
    if (this.props.filterOptions && this.state.filter) {
      return choices.filter(choice =>
        choice[this.props.filterOptions.name] === this.state.filter
      );
    }
    return choices;
  }

  render() {
    const props = this.props;
    return (
      <>
        {
          props.filterOptions &&
            <ChoicesTableFilter
              filterOptions={props.filterOptions}
              input={{onChange: this.setFilter, value: this.state.filter}}
              wrapperClassName="btn-group m-b-xs"
            />
        }
        <PureChoicesTable
          columns={props.columns}
          choices={this.getChoices(props.choices)}
          input={props.input}
        />
      </>
    );
  }
}
