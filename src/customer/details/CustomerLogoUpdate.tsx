import React from 'react';
import { Field } from 'redux-form';

import { CustomerLogoUpdateFormData } from '@waldur/customer/details/types';
import { FileUploadField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';
import { Customer } from '@waldur/workspace/types';

import './CustomerLogoUpdate.scss';

const DEFAULT_LOGO = require('./logo-placeholder.png');

interface CustomerLogoUpdateProps {
  customer: Customer;
  uploadLogo?(): void;
  removeLogo?(): void;
  formData: CustomerLogoUpdateFormData;
}

const hasChosenImage = ({ formData }) => formData && formData.image;

const renderRemoveButton = (props) => {
  if (hasChosenImage(props)) {
    return true;
  } else if (props.customer.image) {
    return true;
  }
  return false;
};

const renderLogo = (props) => {
  if (hasChosenImage(props)) {
    return URL.createObjectURL(props.formData.image);
  } else if (props.customer.image) {
    return props.customer.image;
  } else {
    return DEFAULT_LOGO;
  }
};

export const CustomerLogoUpdate: React.FC<CustomerLogoUpdateProps> = (
  props,
) => (
  <>
    <img
      src={renderLogo(props)}
      alt="Organization logo here"
      className="organization-img-wrapper"
    />
    <div className="m-t-md">
      {renderRemoveButton(props) && (
        <ActionButton
          className="btn btn-sm btn-danger"
          title={translate('Remove logo')}
          action={props.removeLogo}
          icon="fa fa-trash"
        />
      )}
      <Field
        name="image"
        component={(fieldProps) => (
          <FileUploadField
            {...fieldProps}
            accept=".jpg, .jpeg, .png, .svg"
            buttonLabel={translate('Upload new')}
            className="btn btn-sm btn-primary"
          />
        )}
      />
    </div>
  </>
);
