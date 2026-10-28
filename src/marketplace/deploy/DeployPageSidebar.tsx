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
      <div className="card card-bordered w-full mb-4 lg:mb-5.5">
        <div className="card-header">
          <h3 className="mb-0">{translate('Progress')}</h3>
        </div>
        <div className="card-body">
          <FormSteps
            steps={props.steps}
            completedSteps={props.completedSteps}
            disabledSteps={props.disabledSteps}
            errors={{ ...errors, ...submitErrors }}
          />
        </div>
      </div>
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
