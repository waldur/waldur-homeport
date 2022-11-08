import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getFormComponent } from '@waldur/marketplace/common/registry';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButtonSmall } from '@waldur/table/ActionButtonSmall';

import { Offering } from '../types';

const PreviewOfferingDialog = lazyComponent(
  () => import('./PreviewOfferingDialog'),
  'PreviewOfferingDialog',
);

interface PreviewOfferingButtonProps {
  offering: Offering;
  openDialog(): void;
}

const openPreviewOfferingDialog = (props: PreviewOfferingButtonProps) => {
  return openModalDialog(PreviewOfferingDialog, {
    resolve: props,
    size: 'lg',
  });
};

const PurePreviewOfferingButton = (props: PreviewOfferingButtonProps) => {
  const FormComponent = getFormComponent(props.offering.type);
  if (!FormComponent) {
    return null;
  }
  return (
    <ActionButtonSmall
      title={translate('Preview')}
      className="ms-2 rounded btn-light border-0"
      action={props.openDialog}
    >
      <i className="fa fa-eye" />
    </ActionButtonSmall>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openPreviewOfferingDialog(ownProps)),
});

export const PreviewOfferingButton = connect(
  null,
  mapDispatchToProps,
)(PurePreviewOfferingButton);
