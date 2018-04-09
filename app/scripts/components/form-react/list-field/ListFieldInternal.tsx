import * as React from 'react';
import { connect } from 'react-redux';
import { InjectedFormProps } from 'redux-form';

import { openListFieldModal } from '@waldur/form-react/list-field/ListFieldUtils';
import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { translate, TranslateProps } from '@waldur/i18n';

export interface InternalListFieldProps extends InjectedFormProps, TranslateProps {
  openModal(): void;
  onOptionSelected(selectedRow: any);
  selectedOption: any;
  configuration: ListConfiguration;
}

class PureInternalListFieldForm extends React.Component<InternalListFieldProps> {
  render() {
    return (
      <div>
          <a onClick={this.props.openModal}>
            {this.props.selectedOption ? this.props.configuration.selectedValueToShow(this.props.selectedOption) : translate('Choose option')}
          </a>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    openModal: (): void => dispatch(openListFieldModal(ownProps.configuration, ownProps.onOptionSelected)),
  };
};

export const InternalListField = connect(null, mapDispatchToProps)(PureInternalListFieldForm);
