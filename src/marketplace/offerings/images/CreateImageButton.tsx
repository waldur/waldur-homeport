import { connect } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionButton } from '@waldur/table/ActionButton';

const CreateImageDialog = lazyComponent(
  () => import('./CreateImageDialog'),
  'CreateImageDialog',
);

interface CreateImageButtonProps {
  offering: Offering;
  openDialog(): void;
}

const openImageDialog = (props: CreateImageButtonProps) => {
  return openModalDialog(CreateImageDialog, {
    resolve: props,
    size: 'lg',
  });
};

const PureCreateImageButton = (props: CreateImageButtonProps) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '16px',
      }}
    >
      <ActionButton
        title={translate('Add image')}
        icon="fa fa-plus"
        action={props.openDialog}
      />
    </div>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  openDialog: () => dispatch(openImageDialog(ownProps)),
});

export const CreateImageButton = connect(
  null,
  mapDispatchToProps,
)(PureCreateImageButton);
