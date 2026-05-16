import {
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { useSelector } from 'react-redux';
import {
  PublicOfferingDetails,
  marketplaceProjectOrderAutoApprovalsList,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { orderProjectSelector } from './selectors';

interface OrderAutoApprovalNoticeProps {
  offering?: Pick<PublicOfferingDetails, 'components'>;
  monthlyCost: number;
}

export const OrderAutoApprovalNotice: FC<OrderAutoApprovalNoticeProps> = ({
  offering,
  monthlyCost,
}) => {
  const project = useSelector(orderProjectSelector);

  const { data: rule } = useQuery({
    queryKey: ['ProjectOrderAutoApproval', project?.uuid],
    queryFn: () =>
      marketplaceProjectOrderAutoApprovalsList({
        query: { project_uuid: project?.uuid },
      }).then((response) => response.data?.[0] ?? null),
    refetchOnWindowFocus: false,
    staleTime: SHORT_STALE_TIME,
    enabled: !!project?.uuid,
  });

  if (!rule || rule.enabled === false) return null;

  const hasUsageComponent = (offering?.components ?? []).some(
    (c) => c?.billing_type === 'usage',
  );
  const limit = parseFloat(rule.monthly_cost_limit);
  const willAutoApprove = !hasUsageComponent && monthlyCost <= limit;

  const limitLabel = defaultCurrency(limit);
  const monthlyLabel = defaultCurrency(monthlyCost);

  return willAutoApprove ? (
    <div className="d-flex align-items-start gap-2 mt-4 mb-4 text-success fs-7">
      <CheckCircleIcon size={16} weight="fill" className="flex-shrink-0 mt-1" />
      <span>
        <span className="fw-semibold">
          {translate('Order will be auto-approved')}
        </span>
        <br />
        {translate(
          'Estimated monthly cost ({monthly}) is at or below the project limit ({limit}).',
          { monthly: monthlyLabel, limit: limitLabel },
        )}
      </span>
    </div>
  ) : (
    <div className="d-flex align-items-start gap-2 mt-4 mb-4 text-muted fs-7">
      <ClockCounterClockwiseIcon
        size={16}
        weight="bold"
        className="flex-shrink-0 mt-1"
      />
      <span>
        <span className="fw-semibold">
          {translate('Order will need consumer approval')}
        </span>
        <br />
        {hasUsageComponent
          ? translate(
              'This offering has usage-based components, which makes its cost unpredictable. The project auto-approval rule does not apply (limit: {limit}).',
              { limit: limitLabel },
            )
          : translate(
              'Estimated monthly cost ({monthly}) exceeds the project auto-approval limit ({limit}).',
              { monthly: monthlyLabel, limit: limitLabel },
            )}
      </span>
    </div>
  );
};
