import { useSelector } from 'react-redux';

import {
  InjectedVStepperFormSidebarProps,
  VStepperFormSidebar,
} from '@waldur/form/VStepperFormSidebar';
import { translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { getCheckoutSummaryComponent } from '../common/registry';
import { OrderResponse } from '../orders/types';

import { OfferingTosNotification } from './OfferingTosNotification';
import { formErrorsSelector } from './utils';

interface DeployPageSidebarProps extends InjectedVStepperFormSidebarProps {
  offering: Offering;
  updateMode?: boolean;
  cartItem?: OrderResponse;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent =
    getCheckoutSummaryComponent(props.offering.type) || OrderSummary;

  const errors = useSelector(formErrorsSelector);

  return (
    <VStepperFormSidebar
      {...props}
      title={translate('Progress')}
      customSummary={
        <CheckoutSummaryComponent
          offering={
            props.updateMode
              ? { ...props.offering, uuid: props.cartItem.uuid }
              : props.offering
          }
          updateMode={props.updateMode}
        />
      }
      errors={errors}
      extraNode={<OfferingTosNotification offering={props.offering} />}
    />
  );
};
