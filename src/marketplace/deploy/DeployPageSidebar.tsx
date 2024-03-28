import { useSelector } from 'react-redux';

import { FormSteps } from '@waldur/form/FormSteps';
import { SidebarProps } from '@waldur/form/SidebarProps';
import { TosNotification } from '@waldur/form/TosNotification';
import { translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { getCheckoutSummaryComponent } from '../common/registry';
import { OrderResponse } from '../orders/types';

import { OfferingTosNotification } from './OfferingTosNotification';
import { formErrorsSelector } from './utils';
interface DeployPageSidebarProps extends SidebarProps {
  offering: Offering;
  updateMode?: boolean;
  cartItem?: OrderResponse;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent =
    getCheckoutSummaryComponent(props.offering.type) || OrderSummary;

  const errors = useSelector(formErrorsSelector);

  return (
    <>
      <h6 className="fs-7">{translate('Progress')}</h6>
      <FormSteps
        steps={props.steps}
        completedSteps={props.completedSteps}
        errors={errors}
      />
      <CheckoutSummaryComponent
        offering={
          props.updateMode
            ? { ...props.offering, uuid: props.cartItem.uuid }
            : props.offering
        }
        updateMode={props.updateMode}
      />
      <TosNotification />
      <OfferingTosNotification offering={props.offering} />
    </>
  );
};
