import { useFormState } from 'react-final-form';
import { OrderDetails, Offering } from 'waldur-js-client';

import { Card, CardContent, CardHeader } from 'waldur-ui';

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
      <Card bordered className="w-full mb-4 lg:mb-5.5">
        <CardHeader>
          <h3 className="mb-0">{translate('Progress')}</h3>
        </CardHeader>
        <CardContent>
          <FormSteps
            steps={props.steps}
            completedSteps={props.completedSteps}
            disabledSteps={props.disabledSteps}
            errors={{ ...errors, ...submitErrors }}
          />
        </CardContent>
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
