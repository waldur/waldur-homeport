import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { getFormComponent } from '@waldur/marketplace/common/registry';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { PureOfferingConfiguratorProps } from '@waldur/marketplace/details/OfferingConfigurator';
import { OfferingFormData } from '@waldur/marketplace/details/types';
import {
  Offering,
  OfferingConfigurationFormProps,
} from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

import { getDefaultLimits } from './utils';

interface PreviewOfferingOwnProps {
  resolve: {
    offering: Offering;
  };
}

interface PreviewOfferingDialogProps
  extends OfferingConfigurationFormProps,
    PreviewOfferingOwnProps {}

const PurePreviewOfferingDialog = (props: PreviewOfferingDialogProps) => {
  const FormComponent = getFormComponent(props.resolve.offering.type);
  return (
    <ModalDialog
      title={translate('Preview offering')}
      footer={<CloseDialogButton />}
    >
      <FormComponent
        {...props}
        offering={props.resolve.offering}
        previewMode={true}
      />
    </ModalDialog>
  );
};

const storeConnector = connect<
  { project: Project },
  {},
  PreviewOfferingOwnProps,
  RootState
>((state, ownProps) => ({
  project: getProject(state),
  initialValues: {
    limits: getDefaultLimits(ownProps.resolve.offering),
  },
}));

const formConnector = reduxForm<
  OfferingFormData,
  PureOfferingConfiguratorProps
>({ form: FORM_ID, touchOnChange: true });

const enhance = compose(storeConnector, formConnector);

export const PreviewOfferingDialog = enhance(PurePreviewOfferingDialog);
