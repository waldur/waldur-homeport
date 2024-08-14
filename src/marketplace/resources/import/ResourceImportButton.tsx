import { DownloadSimple } from '@phosphor-icons/react';
import React from 'react';
import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const ResourceImportDialog = lazyComponent(
  () => import('./ResourceImportDialog'),
  'ResourceImportDialog',
);

interface ResourceImportButtonProps {
  category_uuid: string;
  openDialog(): void;
}

const PureResourceImportButton: React.FC<ResourceImportButtonProps> = (
  props,
) => (
  <ActionButton
    title={translate('Import')}
    action={props.openDialog}
    iconNode={<DownloadSimple weight="bold" />}
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () =>
    dispatch(
      openModalDialog(ResourceImportDialog, {
        resolve: ownProps,
        size: 'lg',
      }),
    ),
});

const connector = connect(null, mapDispatchToProps);

export const ResourceImportButton = connector(PureResourceImportButton);
