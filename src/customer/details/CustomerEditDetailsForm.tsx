import * as React from 'react';
import { compose } from 'redux';
import { reduxForm, Field, InjectedFormProps } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FileUploadField, SubmitButton } from '@waldur/form-react';
import { translate, TranslateProps, withTranslation } from '@waldur/i18n';

import { CustomerDetailsEditFormData } from './types';

interface OwnProps {
  onSubmit?(formData: CustomerDetailsEditFormData): void;
  hasChosenImage: boolean;
}

type ConnectedProps = OwnProps & InjectedFormProps & TranslateProps;

const PureCustomerEditDetailsForm = (props: ConnectedProps) => (
  <form
    onSubmit={props.handleSubmit(props.onSubmit)}
    className="form-vertical">
      <div>
        <Field
          name="image"
          validate={required}
          component={fieldProps =>
            <FileUploadField
              {...fieldProps}
              accept=".jpg, .jpeg, .png, .svg"
              buttonLabel={translate('Upload new')}
            />
          }
        />
      </div>
      {props.hasChosenImage && <SubmitButton
        className="btn btn-sm btn-success m-t-sm"
        submitting={props.submitting}
        label={props.translate('Update')}
      />}
  </form>
);

const enhance = compose(
  reduxForm<CustomerDetailsEditFormData, OwnProps>({form: 'customerLogo'}),
  withTranslation,
);

export const CustomerEditDetailsForm = enhance(PureCustomerEditDetailsForm);
