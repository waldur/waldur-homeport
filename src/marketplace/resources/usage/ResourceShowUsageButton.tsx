import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ResourceShowUsageDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceShowUsageDialog" */ './ResourceShowUsageDialog'
    ),
  'ResourceShowUsageDialog',
);

const openResourceUsageDialog = (resource: Resource) =>
  openModalDialog(ResourceShowUsageDialog, {
    resolve: {
      resource,
    },
    size: 'lg',
  });

interface ResourceUsageButton {
  resource: Resource;
  openDialog(): void;
}

const PureResourceUsageButton: FunctionComponent<ResourceUsageButton> = (
  props,
) => (
  <ActionButton
    title={translate('Show usage')}
    icon="fa fa-eye"
    action={props.openDialog}
    className="me-3"
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () =>
    dispatch(
      openResourceUsageDialog({
        ...ownProps.resource,
        offering_uuid:
          ownProps.resource.marketplace_offering_uuid ||
          ownProps.resource.offering_uuid,
        resource_uuid:
          ownProps.resource.marketplace_resource_uuid || ownProps.resource.uuid,
      }),
    ),
});

export const ResourceShowUsageButton = connect(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
