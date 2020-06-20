import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Offering } from '@waldur/offering/types';
import { ActionButton } from '@waldur/table/ActionButton';

import { CreateScreenshotDialog } from './CreateScreenshotDialog';

interface CreateScreenshotButtonProps {
  offering: Offering;
  openDialog(): void;
}

const openScreenshotDialog = (props: CreateScreenshotButtonProps) => {
  return openModalDialog(CreateScreenshotDialog, {
    resolve: props,
    size: 'lg',
  });
};

const PureCreateScreenshotButton = (props: CreateScreenshotButtonProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
      }}
    >
      <ActionButton
        title={translate('Add screenshot')}
        icon="fa fa-plus"
        action={props.openDialog}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openScreenshotDialog(ownProps)),
});

export const CreateScreenshotButton = connect(
  null,
  mapDispatchToProps,
)(PureCreateScreenshotButton);
