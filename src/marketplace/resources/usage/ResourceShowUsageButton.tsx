import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ './ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

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

const PureResourceUsageButton: FunctionComponent<ResourceUsageButton> = (
  props,
) => (
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
