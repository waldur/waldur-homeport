import * as React from 'react';
import * as Col from 'react-bootstrap/lib/Col';
import * as Row from 'react-bootstrap/lib/Row';

import { CustomerEditDetailsForm } from '@waldur/customer/details/CustomerEditDetailsForm';
import { CustomerDetailsEditFormData } from '@waldur/customer/details/types';
import { Customer } from '@waldur/customer/types';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table-react/ActionButton';

import './CustomerEditDetails.scss';

const DEFAULT_LOGO = require('./logo-placeholder.png');

interface CustomerEditDetailsProps {
  customer: Customer;
  uploadLogo?(): void;
  removeLogo?(): void;
  formData: CustomerDetailsEditFormData;
  canEdit: boolean;
}

const hasChosenImage = ({ formData }) => formData && formData.image;

const renderRemoveButton = props => {
  if (hasChosenImage(props)) {
    return true;
  } else if (props.customer.image) {
    return true;
  }
  return false;
};

const renderLogo = props => {
  if (hasChosenImage(props)) {
    return URL.createObjectURL(props.formData.image);
  } else if (props.customer.image) {
    return props.customer.image;
  } else {
    return DEFAULT_LOGO;
  }
};

export const CustomerEditDetails: React.FC<CustomerEditDetailsProps> = props => {
  const { canEdit } = props;
  return (
    <div className="customer-edit-details">
      <Row>
        <Col md={3}>
          <div className="organization-logo">
            <div className="organization-img-wrapper">
              <img src={renderLogo(props)} alt="Organization logo here" />
            </div>
          </div>
        </Col>
        {canEdit && (
          <Col md={9}>
            <div className="organization-logo-actions">
              {renderRemoveButton(props) && (
                <ActionButton
                  className="btn btn-sm btn-danger m-b-sm"
                  title={translate('Remove logo')}
                  action={props.removeLogo}
                  icon="fa fa-trash"
                />
              )}
              <CustomerEditDetailsForm
                hasChosenImage={hasChosenImage(props)}
                onSubmit={props.uploadLogo}
              />
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};
