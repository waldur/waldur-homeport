import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import {
  OfferingFormData,
  PureOfferingConfiguratorProps,
} from '@waldur/marketplace/details/types';
import {
  Offering,
  OfferingConfigurationFormProps,
} from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';

import { DeployPage } from '../../deploy/DeployPage';
import { getDefaultLimits } from '../utils';

interface PreviewOfferingOwnProps {
  resolve: {
    offering: Offering;
  };
}

interface PreviewOfferingDialogProps
  extends OfferingConfigurationFormProps,
    PreviewOfferingOwnProps {}

const PurePreviewOfferingDialog = (props: PreviewOfferingDialogProps) => {
  return (
    <ModalDialog
      title={translate('Preview offering')}
      footer={<CloseDialogButton />}
    >
      <DeployPage offering={props.resolve.offering} previewMode={true} />
    </ModalDialog>
  );
};

const storeConnector = connect<{}, {}, PreviewOfferingOwnProps, RootState>(
  (_, ownProps) => ({
    initialValues: {
      limits: getDefaultLimits(ownProps.resolve.offering),
    },
  }),
);

const formConnector = reduxForm<
  OfferingFormData,
  PureOfferingConfiguratorProps
>({ form: ORDER_FORM_ID, touchOnChange: true });

const enhance = compose(storeConnector, formConnector);

export const PreviewOfferingDialog = enhance(PurePreviewOfferingDialog);
