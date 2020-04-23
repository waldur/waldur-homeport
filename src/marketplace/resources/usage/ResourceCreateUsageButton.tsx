import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

import { UsageReportContext } from './types';

const openResourceUsageDialog = (
  resource_uuid: string,
  resource_name: string,
  offering_uuid: string,
) =>
  openModalDialog('marketplaceResourceCreateUsageDialog', {
    resolve: { resource_uuid, resource_name, offering_uuid },
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
  openDialog: () =>
    dispatch(
      openResourceUsageDialog(
        ownProps.resource_uuid,
        ownProps.resource_name,
        ownProps.offering_uuid,
      ),
    ),
});

export const ResourceCreateUsageButton = connect<
  {},
  DispatchProps,
  UsageReportContext
>(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
