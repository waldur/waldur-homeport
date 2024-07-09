import { PencilSimple } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RowActionButton } from '@waldur/table/ActionButton';

import { showHookUpdateDialog } from './actions';

interface HookUpdateButtonProps {
  showHookUpdateDialog?(row?): void;
  row: any;
}

export const PureHookUpdateButton: FunctionComponent<HookUpdateButtonProps> = (
  props,
) => (
  <RowActionButton
    title={translate('Update')}
    action={() => props.showHookUpdateDialog(props.row)}
    iconNode={<PencilSimple />}
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
