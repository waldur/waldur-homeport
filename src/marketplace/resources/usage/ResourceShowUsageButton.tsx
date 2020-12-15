import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

import { ResourceShowUsageDialog } from './ResourceShowUsageDialog';

const openResourceUsageDialog = (offeringUuid: string, resourceUuid: string) =>
  openModalDialog(ResourceShowUsageDialog, {
    resolve: { offeringUuid, resourceUuid },
    size: 'lg',
  });

interface ResourceUsageButton {
  offeringUuid: string;
  resourceUuid: string;
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
  openDialog: () =>
    dispatch(
      openResourceUsageDialog(ownProps.offeringUuid, ownProps.resourceUuid),
    ),
});

export const ResourceShowUsageButton = connect(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
