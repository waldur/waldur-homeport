import { useSelector } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { DeployPageTotalCard } from '@/marketplace/deploy/DeployPageTotalCard';
import { formIsValidSelector } from '@/marketplace/deploy/selectors';
import { formErrorsSelector } from '@/marketplace/deploy/selectors';
import { orderFormDataSelector } from '@/marketplace/deploy/selectors';
import { OrderSubmitButton } from '@/marketplace/details/OrderSubmitButton';

interface CheckoutSummaryProps {
  offering: PublicOfferingDetails;
  updateMode?: boolean;
}

export const CheckoutSummary = ({
  offering,
  updateMode,
}: CheckoutSummaryProps) => {
  const formIsValid = useSelector(formIsValidSelector);
  const formData = useSelector(orderFormDataSelector);
  const errors = useSelector(formErrorsSelector);

  return (
    <DeployPageTotalCard
      offering={offering}
      header={
        <h5 className="fw-normal text-muted mb-0">
          {translate(
            'Charged as part of {name}.',
            {
              name: <strong>{offering.scope_name}</strong>,
            },
            formatJsxTemplate,
          )}
        </h5>
      }
    >
      <OrderSubmitButton
        formData={formData}
        updateMode={updateMode}
        offering={offering}
        errors={errors}
        formValid={formIsValid}
      />
    </DeployPageTotalCard>
  );
};
