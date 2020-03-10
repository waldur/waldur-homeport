import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table-react/ActionButton';

interface Props {
  category_uuid: string;
  project_uuid: string;
  openDialog(): void;
}

const PureResourceImportButton: React.FC<Props> = props => (
  <ActionButton
    title={translate('Import resource')}
    action={props.openDialog}
    icon="fa fa-plus"
  />
);

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () =>
    dispatch(
      openModalDialog('marketplaceResourceImportDialog', {
        resolve: ownProps,
        size: 'lg',
      }),
    ),
});

const connector = connect(null, mapDispatchToProps);

export const ResourceImportButton = connector(PureResourceImportButton);
