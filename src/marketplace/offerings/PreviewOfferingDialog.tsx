import * as React from 'react';
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
import { connectAngularComponent } from '@waldur/store/connect';
import { getProject } from '@waldur/workspace/selectors';
import { OuterState, Project } from '@waldur/workspace/types';

interface PurePreviewOfferingDialogProps
  extends OfferingConfigurationFormProps {
  resolve: {
    offering: Offering;
  };
}

const PurePreviewOfferingDialog = (props: PurePreviewOfferingDialogProps) => {
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
  { offering: Offering },
  OuterState
>(state => ({ project: getProject(state) }));

const formConnector = reduxForm<
  OfferingFormData,
  PureOfferingConfiguratorProps
>({ form: FORM_ID, touchOnChange: true });

const enhance = compose(storeConnector, formConnector);

const PreviewOfferingDialog = enhance(PurePreviewOfferingDialog);

export default connectAngularComponent(PreviewOfferingDialog, ['resolve']);
