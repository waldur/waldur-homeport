import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation, TranslateProps } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/coreSaga';
import { ActionButton } from '@waldur/table-react/ActionButton';
import { deleteEntity } from '@waldur/table-react/actions';

import { showKeyRemoveConfirmation } from './actions';
import { removeKey } from './api';
import * as constants from './constants';

const mapDispatchToProps = dispatch => ({
  showConfirmDialog: (action: () => void) =>
    dispatch(showKeyRemoveConfirmation(action)),
  removeEntity: (id: string) =>
    dispatch(deleteEntity(constants.keysListTable, id)),
  showError: (message: string) => dispatch(showError(message)),
  showSuccess: (message: string) => dispatch(showSuccess(message)),
});

interface OwnProps {
  uuid: string;
}

interface DispatchProps {
  showConfirmDialog: (action: () => void) => void;
  removeEntity: (id: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

interface KeyRemoveButtonState {
  removing: boolean;
}

class KeyRemoveButtonComponent extends React.Component<
  OwnProps & DispatchProps & TranslateProps,
  KeyRemoveButtonState
> {
  state = {
    removing: false,
  };

  async removeKey(id: string) {
    try {
      this.setState({ removing: true });
      await removeKey(id);
      this.props.removeEntity(id);
      this.props.showSuccess(this.props.translate('SSH key has been removed.'));
    } catch (e) {
      this.props.showError(this.props.translate('Unable to remove SSH key.'));
    }
  }

  render() {
    return (
      <>
        <ActionButton
          title={this.props.translate('Remove')}
          action={() =>
            this.props.showConfirmDialog(() => this.removeKey(this.props.uuid))
          }
          icon={this.state.removing ? 'fa fa-spinner fa-spin' : 'fa fa-trash'}
          disabled={this.state.removing}
        />
      </>
    );
  }
}

const enhance = compose(
  connect<{}, DispatchProps, OwnProps>(null, mapDispatchToProps),
  withTranslation,
);

export const KeyRemoveButton = enhance(KeyRemoveButtonComponent);
