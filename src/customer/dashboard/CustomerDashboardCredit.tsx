import { EyeIcon, WarningOctagonIcon } from '@phosphor-icons/react';
import { Col } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { COMMON_WIDGET_HEIGHT } from '@waldur/dashboard/constants';
import { WidgetCard } from '@waldur/dashboard/WidgetCard';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { Customer } from '@waldur/workspace/types';

import { useCustomerCreditChart } from './utils';

const FilteredEventsDialog = lazyComponent(() =>
  import('@waldur/customer/credits/CreditUsageDialog').then((module) => ({
    default: module.CreditUsageDialog,
  })),
);

export const CustomerDashboardCredit = ({
  customer,
  className,
}: {
  customer: Customer;
  className?: string;
}) => {
  const { credit, chart, options, error, isLoading, refetch } =
    useCustomerCreditChart(customer);

  const { openDialog } = useModal();
  const viewDetails = () => {
    openDialog(FilteredEventsDialog, {
      size: 'xl',
      creditUuid: credit.uuid,
      customerUuid: customer.uuid,
      customerName: customer.name,
      scope: 'customer',
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        message={translate('Unable to load data.')}
        loadData={refetch}
      />
    );
  }
  if (!credit) {
    return null;
  }

  return (
    <Col md={12} sm={12} className={className} style={COMMON_WIDGET_HEIGHT}>
      <WidgetCard
        cardTitle={
          <>
            {chart.title}
            <small className="text-muted fs-7 ms-4 fw-normal">
              ({translate('Current balance')}: {defaultCurrency(credit.value)})
            </small>
            {credit.allocated_to_projects > Number(credit.value) && (
              <Tip
                id="tip-credit-warn"
                label={translate('Credit is overallocated')}
                className="ms-2"
              >
                <WarningOctagonIcon
                  className="text-warning"
                  weight="bold"
                  size={16}
                />
              </Tip>
            )}
          </>
        }
        actions={[
          {
            label: translate('Details'),
            icon: <EyeIcon />,
            callback: viewDetails,
          },
        ]}
        className="h-100"
      >
        <EChart options={options} height="130px" />
      </WidgetCard>
    </Col>
  );
};
