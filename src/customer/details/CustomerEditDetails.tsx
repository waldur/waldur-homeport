import * as React from 'react';

import { CustomerEditDetailsForm } from '@waldur/customer/details/CustomerEditDetailsForm';
import { CustomerDetailsEditFormData } from '@waldur/customer/details/types';
import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

import './CustomerEditDetails.scss';

// tslint:disable-next-line
const DEFAULT_LOGO = require('./logo-placeholder.png');

interface CustomerEditDetailsProps {
  customer: Customer;
  uploadLogo?(): void;
  removeLogo?(): void;
  formData: CustomerDetailsEditFormData;
}

const renderRemoveButton = props => {
  if (props.formData && props.formData.image) {
    return true;
  } else if (props.customer.image) {
    return true;
  }
  return false;
};

const renderLogo = props => {
  if (props.formData && props.formData.image) {
    return URL.createObjectURL(props.formData.image);
  } else if (props.customer.image) {
    return props.customer.image;
  } else {
    return DEFAULT_LOGO;
  }
};

export const CustomerEditDetails: React.SFC<CustomerEditDetailsProps> = (props: CustomerEditDetailsProps) => (
  <div className="panel panel-default">
    <div className="panel-heading">
      {translate('Organization logo')}
    </div>
    <div className="panel-body">
      <div className="customer-edit-details">
        <div className="row">
          <div className="col-md-6">
            <div className="organization-logo">
              <div className="organization-img-wrapper">
                <img src={renderLogo(props)} alt="Organization logo here"/>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="organization-logo-actions">
              {renderRemoveButton(props) &&
                <ActionButton
                  className="btn btn-sm btn-danger m-b-sm"
                  title={translate('Remove logo')}
                  action={props.removeLogo}
                  icon="fa fa-trash"/>
              }
              <CustomerEditDetailsForm onSubmit={props.uploadLogo}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
