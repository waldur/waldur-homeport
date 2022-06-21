import { Component } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';
import { deleteEntity } from '@waldur/table/actions';

import { showHookRemoveConfirmation } from './actions';
import { removeHook } from './api';
import * as constants from './constants';

const mapDispatchToProps = (dispatch) => ({
  showConfirmDialog: (action: () => void) =>
    dispatch(showHookRemoveConfirmation(action)),
  removeEntity: (id: string) =>
    dispatch(deleteEntity(constants.HOOK_LIST_ID, id)),
  showError: (message: string) => dispatch(showError(message)),
  showSuccess: (message: string) => dispatch(showSuccess(message)),
});

interface OwnProps {
  uuid: string;
  url: string;
}

interface DispatchProps {
  showConfirmDialog: (action: () => void) => void;
  removeEntity: (id: string) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

interface HookRemoveButtonState {
  removing: boolean;
}

class HookRemoveButtonComponent extends Component<
  OwnProps & DispatchProps,
  HookRemoveButtonState
> {
  state = {
    removing: false,
  };

  async removeHook(uuid: string, url: string) {
    try {
      this.setState({ removing: true });
      await removeHook(url);
      this.props.removeEntity(uuid);
      this.props.showSuccess(translate('Hook has been removed.'));
    } catch (e) {
      this.props.showError(translate('Unable to remove hook.'));
    }
  }

  render() {
    const { uuid, url } = this.props;
    return (
      <ActionButtonSmall
        title={translate('Remove')}
        action={() =>
          this.props.showConfirmDialog(() => this.removeHook(uuid, url))
        }
        disable={this.state.removing}
        className="btn btn-secondary"
      >
        <i
          className={
            this.state.removing ? 'fa fa-spinner fa-spin' : 'fa fa-trash'
          }
        />
      </ActionButtonSmall>
    );
  }
}

const enhance = connect<{}, DispatchProps, OwnProps>(null, mapDispatchToProps);

export const HookRemoveButton = enhance(HookRemoveButtonComponent);
