import { Eye } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Resource } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

const ResourceShowUsageDialog = lazyComponent(
  () => import('./ResourceShowUsageDialog'),
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
  <ActionItem
    title={translate('Show usage')}
    iconNode={<Eye />}
    action={props.openDialog}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () =>
    dispatch(
      openResourceUsageDialog({
        ...ownProps.row,
        offering_uuid:
          ownProps.row.marketplace_offering_uuid || ownProps.row.offering_uuid,
        resource_uuid:
          ownProps.row.marketplace_resource_uuid || ownProps.row.uuid,
      }),
    ),
});

export const ResourceShowUsageButton = connect(
  null,
  mapDispatchToProps,
)(PureResourceUsageButton);
