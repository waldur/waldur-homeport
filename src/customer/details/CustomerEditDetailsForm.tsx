import { FunctionComponent } from 'react';
import { compose } from 'redux';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FileUploadField, SubmitButton } from '@waldur/form';
import { translate, TranslateProps, withTranslation } from '@waldur/i18n';

import { CustomerLogoUpdateFormData } from './types';

interface OwnProps {
  onSubmit?(formData: CustomerLogoUpdateFormData): void;
  hasChosenImage: boolean;
}

type ConnectedProps = OwnProps & InjectedFormProps & TranslateProps;

const PureCustomerEditDetailsForm: FunctionComponent<ConnectedProps> = (
  props,
) => (
  <form onSubmit={props.handleSubmit(props.onSubmit)} className="form-vertical">
    <div>
      <Field
        name="image"
        validate={required}
        component={(fieldProps) => (
          <FileUploadField
            {...fieldProps}
            accept=".jpg, .jpeg, .png, .svg"
            buttonLabel={translate('Upload new')}
          />
        )}
      />
    </div>
    {props.hasChosenImage && (
      <SubmitButton
        className="btn btn-sm btn-success m-t-sm"
        submitting={props.submitting}
        label={props.translate('Update')}
      />
    )}
  </form>
);

const enhance = compose(
  reduxForm<CustomerLogoUpdateFormData, OwnProps>({ form: 'customerLogo' }),
  withTranslation,
);

export const CustomerEditDetailsForm = enhance(PureCustomerEditDetailsForm);
