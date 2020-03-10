import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { showHookUpdateDialog } from './actions';

interface HookUpdateButtonProps {
  showHookUpdateDialog?(row?): void;
  row: any;
}

export const PureHookUpdateButton = (props: HookUpdateButtonProps) => (
  <ActionButton
    title={translate('Update')}
    action={() => props.showHookUpdateDialog(props.row)}
    icon="fa fa-pencil"
    className="btn btn-sm btn-default m-r-xs"
  />
);

const mapDispatchToProps = dispatch => ({
  showHookUpdateDialog: row => dispatch(showHookUpdateDialog(row)),
});

export const HookUpdateButton = connect(
  undefined,
  mapDispatchToProps,
)(PureHookUpdateButton);
