import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n/translate';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { showHookUpdateDialog } from './actions';

interface HookCreateButtonProps {
  showHookUpdateDialog?(): void;
}

export const PureHookCreateButton = (props: HookCreateButtonProps) => (
  <ActionButton
    title={translate('Add notification')}
    action={props.showHookUpdateDialog}
    icon="fa fa-plus"
  />
);

const mapDispatchToProps = dispatch => ({
  showHookUpdateDialog: () => dispatch(showHookUpdateDialog()),
});

export const HookCreateButton = connect(
  undefined,
  mapDispatchToProps,
)(PureHookCreateButton);
