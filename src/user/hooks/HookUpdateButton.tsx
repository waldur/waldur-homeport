import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { EditButton } from '@waldur/form/EditButton';
import { translate } from '@waldur/i18n';

import { showHookUpdateDialog } from './actions';

interface HookUpdateButtonProps {
  showHookUpdateDialog?(row?): void;
  row: any;
}

export const PureHookUpdateButton: FunctionComponent<HookUpdateButtonProps> = (
  props,
) => (
  <EditButton
    title={translate('Update')}
    onClick={() => props.showHookUpdateDialog(props.row)}
    size="sm"
  />
);

const mapDispatchToProps = (dispatch) => ({
  showHookUpdateDialog: (row) => dispatch(showHookUpdateDialog(row)),
});

export const HookUpdateButton = connect(
  undefined,
  mapDispatchToProps,
)(PureHookUpdateButton);
