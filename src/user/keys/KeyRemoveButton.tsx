import { Component } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { deleteEntity } from '@waldur/table/actions';

import { showKeyRemoveConfirmation } from './actions';
import { removeKey } from './api';
import * as constants from './constants';

const mapDispatchToProps = (dispatch) => ({
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

class KeyRemoveButtonComponent extends Component<
  OwnProps & DispatchProps,
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
      this.props.showSuccess(translate('SSH key has been removed.'));
    } catch (e) {
      this.props.showError(translate('Unable to remove SSH key.'));
    }
  }

  render() {
    return (
      <>
        <ActionButton
          title={translate('Remove')}
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

const enhance = connect<{}, DispatchProps, OwnProps>(null, mapDispatchToProps);

export const KeyRemoveButton = enhance(KeyRemoveButtonComponent);
