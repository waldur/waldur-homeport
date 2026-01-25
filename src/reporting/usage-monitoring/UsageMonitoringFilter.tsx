import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { formatBillingPeriod, getPreviousBillingPeriods } from './utils';

interface BillingPeriodOption {
  value: string;
  label: string;
}

const billingPeriodOptions: BillingPeriodOption[] = getPreviousBillingPeriods(
  6,
).map((period) => ({
  value: period,
  label: formatBillingPeriod(period),
}));

interface UsageMonitoringFilterProps {
  billingPeriod: string;
  onBillingPeriodChange: (period: string) => void;
}

export const UsageMonitoringFilter: FC<UsageMonitoringFilterProps> = ({
  billingPeriod,
  onBillingPeriodChange,
}) => {
  const selectedPeriod = billingPeriodOptions.find(
    (o) => o.value === billingPeriod,
  );

  return (
    <Row className="mb-6 g-3">
      <Col xs={12} sm={6} md={4} lg={3}>
        <Select
          placeholder={translate('Billing period')}
          value={selectedPeriod}
          onChange={(option: BillingPeriodOption | null) =>
            option && onBillingPeriodChange(option.value)
          }
          options={billingPeriodOptions}
          isClearable={false}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </Col>
    </Row>
  );
};
