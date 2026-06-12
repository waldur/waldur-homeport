import { formatJsxTemplate, translate } from '@/i18n';
import { DeployPageTotalCard } from '@/marketplace/deploy/DeployPageTotalCard';
import { CheckoutSummaryProps } from '@/marketplace/deploy/types';
import { OrderSubmitButton } from '@/marketplace/details/OrderSubmitButton';

export const CheckoutSummary = ({ offering }: CheckoutSummaryProps) => (
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
    <OrderSubmitButton />
  </DeployPageTotalCard>
);
