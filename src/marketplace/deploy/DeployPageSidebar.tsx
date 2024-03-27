import { useSelector } from 'react-redux';

import { ExternalLink } from '@waldur/core/ExternalLink';
import {
  InjectedVStepperFormSidebarProps,
  VStepperFormSidebar,
} from '@waldur/form/VStepperFormSidebar';
import { formatJsx, translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { getCheckoutSummaryComponent } from '../common/registry';
import { OrderResponse } from '../orders/types';

import { ProviderTermsOfService } from './ProviderTermsOfService';
import { formErrorsSelector } from './utils';

interface DeployPageSidebarProps extends InjectedVStepperFormSidebarProps {
  offering: Offering;
  updateMode?: boolean;
  cartItem?: OrderResponse;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent = getCheckoutSummaryComponent(
    props.offering.type,
  );

  const errors = useSelector(formErrorsSelector);

  return (
    <VStepperFormSidebar
      {...props}
      title={translate('Progress')}
      customSummary={
        CheckoutSummaryComponent ? (
          <CheckoutSummaryComponent
            offering={
              props.updateMode
                ? { ...props.offering, uuid: props.cartItem.uuid }
                : props.offering
            }
            updateMode={props.updateMode}
          />
        ) : (
          <OrderSummary
            offering={
              props.updateMode
                ? { ...props.offering, uuid: props.cartItem.uuid }
                : props.offering
            }
            updateMode={props.updateMode}
          />
        )
      }
      errors={errors}
      extraNode={
        (props.offering.terms_of_service ||
          props.offering.terms_of_service_link) &&
        props.offering.privacy_policy_link ? (
          <p className="text-center fs-9 mb-0">
            {translate(
              'You also agree to the service provider’s <tos>terms of service</tos> and provider’s <pp>privacy policy</pp>.',
              {
                tos: (s: string) => (
                  <ProviderTermsOfService
                    termsOfService={props.offering.terms_of_service}
                    termsOfServiceLink={props.offering.terms_of_service_link}
                    label={s}
                  />
                ),
                pp: (s: string) => (
                  <ExternalLink
                    url={props.offering.privacy_policy_link}
                    label={s}
                    iconless
                  />
                ),
              },
              formatJsx,
            )}
          </p>
        ) : props.offering.terms_of_service ||
          props.offering.terms_of_service_link ? (
          <p className="text-center fs-9 mb-0">
            {translate(
              'You also agree to the service provider’s <tos>terms of service</tos>.',
              {
                tos: (s: string) => (
                  <ProviderTermsOfService
                    termsOfService={props.offering.terms_of_service}
                    termsOfServiceLink={props.offering.terms_of_service_link}
                    label={s}
                  />
                ),
              },
              formatJsx,
            )}
          </p>
        ) : props.offering.privacy_policy_link ? (
          <p className="text-center fs-9 mb-0">
            {translate(
              'You also agree to the service provider’s <pp>privacy policy</pp>.',
              {
                pp: (s: string) => (
                  <ExternalLink
                    url={props.offering.privacy_policy_link}
                    label={s}
                    iconless
                  />
                ),
              },
              formatJsx,
            )}
          </p>
        ) : null
      }
    />
  );
};
