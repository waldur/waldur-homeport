import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ResourceCreateUsageDialog } from './ResourceCreateUsageDialog';
import { UsageReportContext } from './types';

const openResourceUsageDialog = (props: UsageReportContext) =>
  openModalDialog(ResourceCreateUsageDialog, {
    resolve: props,
  });

interface DispatchProps {
  openDialog(): void;
}

const PureResourceUsageButton = (props: UsageReportContext & DispatchProps) => (
  <ActionButton
    title={translate('Report usage')}
    icon="fa fa-plus"
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps: UsageReportContext) => ({
  openDialog: () => dispatch(openResourceUsageDialog(ownProps)),
});

export const ResourceCreateUsageButton = connect<
  {},
  DispatchProps,
  UsageReportContext
>(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
