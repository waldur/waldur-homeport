import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  OrderDetails as OrderResponse,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarProps } from '@waldur/form/SidebarProps';
import { translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';

import { getCheckoutSummaryComponent } from '../common/registry';

import { formSubmitErrorsSelector } from './selectors';
import { formErrorsSelector } from './selectors';

interface DeployPageSidebarProps extends SidebarProps {
  offering: PublicOfferingDetails;
  updateMode?: boolean;
  order?: OrderResponse;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent =
    getCheckoutSummaryComponent(props.offering.type) || OrderSummary;

  const errors = useSelector(formErrorsSelector);
  const submitErrors = useSelector(formSubmitErrorsSelector);

  return (
    <>
      <Card className="card-bordered w-100 mb-5 mb-lg-7">
        <Card.Header>
          <h3 className="mb-0">{translate('Progress')}</h3>
        </Card.Header>
        <Card.Body>
          <FormSteps
            steps={props.steps}
            completedSteps={props.completedSteps}
            errors={{ ...errors, ...submitErrors }}
          />
        </Card.Body>
      </Card>
      <CheckoutSummaryComponent
        offering={
          props.updateMode
            ? { ...props.offering, uuid: props.order.uuid }
            : props.offering
        }
        updateMode={props.updateMode}
      />
    </>
  );
};
