import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { UsageReportContext } from './types';

const ResourceCreateUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceCreateUsageDialog" */ './ResourceCreateUsageDialog'
    ),
  'ResourceCreateUsageDialog',
);

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
