import { Trash } from '@phosphor-icons/react';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Field } from 'redux-form';

import { FileUploadField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { showError, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { Customer } from '@waldur/workspace/types';

import './CustomerLogoUpdate.scss';
import * as api from './api';
import DEFAULT_LOGO from './logo-placeholder.png';

interface CustomerLogoUpdateProps {
  customer: Customer;
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
) => {
  const dispatch = useDispatch();

  async function removeLogo() {
    try {
      if (props.customer.image) {
        await api.removeLogo({ customerUuid: props.customer.uuid });
        dispatch(showSuccess(translate('Logo has been removed.')));
      }
    } catch (error) {
      dispatch(showError(translate('Unable to remove logo.')));
    }
  }

  return (
    <>
      <img
        src={renderLogo(props)}
        alt="Organization logo here"
        className="organization-img-wrapper"
      />
      <div className="mt-3">
        {renderRemoveButton(props) && (
          <ActionButton
            className="btn btn-sm btn-danger"
            title={translate('Remove logo')}
            action={removeLogo}
            iconNode={<Trash />}
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
};
