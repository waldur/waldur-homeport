import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getFormComponent } from '@waldur/marketplace/common/registry';
import { openModalDialog } from '@waldur/modal/actions';
import { Offering } from '@waldur/offering/types';
import { ActionButton } from '@waldur/table/ActionButton';

const PreviewOfferingDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "PreviewOfferingDialog" */ './PreviewOfferingDialog'
    ),
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
    <ActionButton
      title={translate('Preview')}
      icon="fa fa-eye"
      action={props.openDialog}
    />
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openPreviewOfferingDialog(ownProps)),
});

export const PreviewOfferingButton = connect(
  null,
  mapDispatchToProps,
)(PurePreviewOfferingButton);
