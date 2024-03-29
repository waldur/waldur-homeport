import React from 'react';

import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';
import { translate } from '@waldur/i18n';

import { ListDialog } from './ListDialog';

export interface SelectDialogFieldChoice extends Record<string, any> {
  url: string;
  uuid: string;
  name: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface SelectDialogFieldColumn {
  name: string;
  label: React.ReactNode;
  headerClass?: string;
  filter?(input: string): string;
}

interface OwnProps {
  id?: string;
  label?: React.ReactNode;
  dialogTitle?: string;
  preSelectFirst?: boolean;
  emptyMessage?: React.ReactNode;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  filterOptions?: FilterOptions;
  input: CustomComponentInputProps<SelectDialogFieldChoice>;
}

export class SelectDialogField extends React.Component<OwnProps> {
  state = {
    showListDialog: false,
    value: null,
  };

  openSelectDialog = (e) => {
    e.preventDefault();
    this.setState({ showListDialog: true });
  };

  closeSelectDialog = () => {
    this.setState({ showListDialog: false });
  };

  onChange = (value) => {
    this.setState({ value });
  };

  componentDidMount() {
    if (this.props.preSelectFirst && this.props.choices.length !== 0) {
      this.onChange(this.props.choices[0]);
      this.props.input.onChange(this.props.choices[0]);
    }
  }

  render() {
    const props = this.props;
    if (props.choices && props.choices.length === 0) {
      return (
        <div className="form-control-static">
          {props.emptyMessage ? (
            <span className="text-danger">{props.emptyMessage}</span>
          ) : (
            <>&mdash;</>
          )}
        </div>
      );
    }
    return (
      <div className="form-control-static">
        <a onClick={this.openSelectDialog} id={props.id}>
          {(props.input.value && props.input.value.name) ||
            props.label ||
            translate('Show choices')}{' '}
          <i className="fa fa-caret-down" />
        </a>
        <ListDialog
          show={this.state.showListDialog}
          title={props.dialogTitle}
          columns={props.columns}
          choices={props.choices}
          input={{
            name: this.props.input.name,
            value: this.state.value || this.props.input.value,
            onChange: this.onChange,
          }}
          filterOptions={props.filterOptions}
          onSelect={props.input.onChange}
          onClose={this.closeSelectDialog}
        />
      </div>
    );
  }
}
