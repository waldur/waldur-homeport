import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { Offering } from '@waldur/offering/types';
import { ActionButton } from '@waldur/table-react/ActionButton';

interface OfferingAddScreenshotButtonProps {
  offering: Offering;
  openDialog(): void;
}

const openPreviewOfferingDialog = (props: OfferingAddScreenshotButtonProps) => {
  return openModalDialog('marketplaceAddOfferingScreenshotDialog', {
    resolve: props,
    size: 'lg',
  });
};

const PureOfferingAddScreenshotButton = (
  props: OfferingAddScreenshotButtonProps,
) => {
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
  openDialog: () => dispatch(openPreviewOfferingDialog(ownProps)),
});

export const OfferingAddScreenshotButton = connect(
  null,
  mapDispatchToProps,
)(PureOfferingAddScreenshotButton);
