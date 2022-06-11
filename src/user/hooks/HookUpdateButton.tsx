import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';

import { showHookUpdateDialog } from './actions';

interface HookUpdateButtonProps {
  showHookUpdateDialog?(row?): void;
  row: any;
}

export const PureHookUpdateButton: FunctionComponent<HookUpdateButtonProps> = (
  props,
) => (
  <ActionButtonSmall
    title={translate('Update')}
    action={() => props.showHookUpdateDialog(props.row)}
    className="btn btn-secondary"
  >
    <i className="fa fa-pencil" />
  </ActionButtonSmall>
);

const mapDispatchToProps = (dispatch) => ({
  showHookUpdateDialog: (row) => dispatch(showHookUpdateDialog(row)),
});

export const HookUpdateButton = connect(
  undefined,
  mapDispatchToProps,
)(PureHookUpdateButton);
