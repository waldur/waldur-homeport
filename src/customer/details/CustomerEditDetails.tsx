import * as React from 'react';
import { Row, Col } from 'react-bootstrap';

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
  canEdit: boolean;
}

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

const hasChosenImage = ({ formData }) => formData && formData.image;

export const CustomerEditDetails: React.SFC<CustomerEditDetailsProps> = (props: CustomerEditDetailsProps) => {
  const { canEdit } = props;
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        {translate('Organization logo')}
      </div>
      <div className="panel-body">
        <div className="customer-edit-details">
          <Row>
            <Col md={canEdit ? 6 : 12}>
              <div className="organization-logo">
                <div className="organization-img-wrapper">
                  <img src={renderLogo(props)} alt="Organization logo here"/>
                </div>
              </div>
            </Col>
            {canEdit &&
              <Col md={6}>
                <div className="organization-logo-actions">
                  {renderRemoveButton(props) &&
                    <ActionButton
                      className="btn btn-sm btn-danger m-b-sm"
                      title={translate('Remove logo')}
                      action={props.removeLogo}
                      icon="fa fa-trash"/>
                  }
                  {canEdit &&
                    <CustomerEditDetailsForm
                      hasChosenImage={hasChosenImage(props)}
                      onSubmit={props.uploadLogo}/>
                  }
                </div>
              </Col>
            }
          </Row>
        </div>
      </div>
    </div>
  );
};
