import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import ActionButton from '@waldur/table-react/ActionButton';

// tslint:disable-next-line:variable-name
const openResourceUsageDialog = (resource_uuid: string, offering_uuid: string) =>
  openModalDialog('marketplaceResourceCreateUsageDialog', {
    resolve: {resource_uuid, offering_uuid},
  });

interface ResourceUsageButton {
  offering_uuid: string;
  resource_uuid: string;
  openDialog(): void;
}

const PureResourceUsageButton = (props: ResourceUsageButton) => (
  <ActionButton
    title={translate('Report usage')}
    icon="fa fa-plus"
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openResourceUsageDialog(
    ownProps.resource_uuid, ownProps.offering_uuid)),
});

export const ResourceCreateUsageButton = connect(null, mapDispatchToProps)(PureResourceUsageButton);
