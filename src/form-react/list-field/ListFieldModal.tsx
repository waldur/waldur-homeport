import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, InjectedFormProps, reduxForm } from 'redux-form';

import { ListConfiguration } from '@waldur/form-react/list-field/types';
import { translate } from '@waldur/i18n';
import { TranslateProps, withTranslation } from '@waldur/i18n/index';
import { closeModalDialog } from '@waldur/modal/actions';
import { connectAngularComponent } from '@waldur/store/connect';

interface PureListFieldModalProps extends InjectedFormProps, TranslateProps {
  closeModal(): void;

  resolve: {
    configuration: ListConfiguration;
    onOptionSelected(selectedRow: any);
  };
}

export class PureListFieldModal extends React.Component<PureListFieldModalProps> {
  state = {
    loading: true,
    selectedRowIndex: undefined,
  };
  configuration = this.props.resolve.configuration;

  constructor(props) {
    super(props);
    this.saveAndClose = this.saveAndClose.bind(this);
    this.selectRow = this.selectRow.bind(this);
  }

  saveAndClose() {
    this.props.resolve.onOptionSelected(this.configuration.choices[this.state.selectedRowIndex]);
    this.props.closeModal();
  }

  selectRow(index) {
    this.setState({
      ... this.state,
      selectedRowIndex: index,
    });
  }

  render() {
    const {closeModal, resolve: {configuration: {columns, choices}}} = this.props;

    const radioButton = props => (
      <input {...props.input}
             name="optionRadioButton"
             type="radio"
             checked={props.selectedRowIndex === this.state.selectedRowIndex}
             value={props.selectedRow.name}/>
    );

    return (
      <div className="attachment-modal">
        <div className="attachment-modal__close" onClick={closeModal}>
          <i className="fa fa-times" aria-hidden="true"/>
        </div>
        <div className="modal-header">
          {translate('Please select one')}
        </div>
        <div className="modal-body attachment-modal__img">
          <div className="table-responsive" style={{maxHeight: '300px', overflowY: 'auto'}}>
            <form>
              <table className="table">
                <thead>
                <tr>
                  {columns.map((column, columnIndex) => (
                    <th className="col-md-4" key={columnIndex}>{column.label}</th>
                  ))}
                </tr>
                </thead>
                <tbody>
                {choices.map((choice, choicesIndex) => (
                  <tr style={{cursor: 'pointer'}} onClick={() => this.selectRow(choicesIndex)} key={choicesIndex}>
                    {columns.map((column, columnIndex) => (
                      <td key={columnIndex}>
                        {column.name(choice)}
                      </td>
                    ))}
                    <td>
                      <Field
                        name="listFieldSelection"
                        component={radioButton}
                        {...{selectedRow: choices[choicesIndex], selectedRowIndex: choicesIndex}as any}/>
                    </td>
                  </tr>
                ))
                }
                </tbody>
              </table>
            </form>
          <button className="btn btn-primary" onClick={this.saveAndClose}>Select</button>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  closeModal: (): void => dispatch(closeModalDialog()),
});

const enhance = compose(
  connect(null, mapDispatchToProps),
  reduxForm({form: 'listFieldModal'}),
  withTranslation,
);

const ListFieldModal = enhance(PureListFieldModal);

export default connectAngularComponent(ListFieldModal, ['resolve']);
