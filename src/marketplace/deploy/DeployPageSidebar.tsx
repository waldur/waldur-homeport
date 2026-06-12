import { Card } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { OrderDetails, Offering } from 'waldur-js-client';

import { SidebarProps } from '@/form/SidebarProps';
import { translate } from '@/i18n';
import { OrderSummary } from '@/marketplace/details/OrderSummary';
import { FormSteps } from '@/wizard';

import { getCheckoutSummaryComponent } from '../common/registry';

interface DeployPageSidebarProps extends SidebarProps {
  offering: Offering;
  updateMode?: boolean;
  order?: OrderDetails;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent =
    getCheckoutSummaryComponent(props.offering.type) || OrderSummary;

  const { errors, submitErrors } = useFormState({
    subscription: { errors: true, submitErrors: true },
  });

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
            disabledSteps={props.disabledSteps}
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
