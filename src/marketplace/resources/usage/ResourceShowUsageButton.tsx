import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

const openResourceUsageDialog = (id: string) =>
  openModalDialog('marketplaceResourceShowUsageDialog', {
    resolve: { resource_uuid: id },
  });

interface ResourceUsageButton {
  resource: string;
  openDialog(): void;
}

const PureResourceUsageButton = (props: ResourceUsageButton) => (
  <ActionButton
    title={translate('Show usage')}
    icon="fa fa-eye"
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openResourceUsageDialog(ownProps.resource)),
});

export const ResourceShowUsageButton = connect(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
