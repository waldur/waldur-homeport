import * as React from 'react';

import { SelectDialogFieldColumn, SelectDialogFieldChoice } from '@waldur/form-react/types';
import { AppstoreListDialog } from '@waldur/form/AppstoreListDialog';
import { CustomComponentInputProps, FilterOptions } from '@waldur/form/types';
import { TranslateProps } from '@waldur/i18n';

interface OwnProps {
  label?: React.ReactNode;
  dialogTitle?: string;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  filterOptions?: FilterOptions;
  input: CustomComponentInputProps;
}

export class SelectDialogField extends React.Component<OwnProps & TranslateProps> {
  state = {
    showListDialog: false,
    value: null,
  };

  openSelectDialog = e => {
    e.preventDefault();
    this.setState({showListDialog: true});
  }

  closeSelectDialog = () => {
    this.setState({showListDialog: false});
  }

  onChange = value => {
    this.setState({value});
  }

  render() {
    const props = this.props;
    return (
      <div className="form-control-static">
        <a onClick={this.openSelectDialog}>
          {props.input.value || props.label || props.translate('Show choices')}
          {' '}
          <i className="fa fa-caret-down"/>
        </a>
        <AppstoreListDialog
          show={this.state.showListDialog}
          title={props.dialogTitle}
          columns={props.columns}
          choices={props.choices}
          input={{
            name: this.props.input.name,
            value: this.state.value,
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
