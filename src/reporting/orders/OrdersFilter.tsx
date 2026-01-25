import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface DateRangeOption {
  value: number;
  label: string;
}

const dateRangeOptions: DateRangeOption[] = [
  { value: 7, label: translate('Last 7 days') },
  { value: 14, label: translate('Last 14 days') },
  { value: 30, label: translate('Last 30 days') },
  { value: 60, label: translate('Last 60 days') },
  { value: 90, label: translate('Last 90 days') },
];

interface OrdersFilterProps {
  days: number;
  onDaysChange: (days: number) => void;
}

export const OrdersFilter: FC<OrdersFilterProps> = ({ days, onDaysChange }) => {
  const selectedDateRange = dateRangeOptions.find((o) => o.value === days);

  return (
    <Row className="mb-6 g-3">
      <Col xs={12} sm={6} md={4} lg={3}>
        <Select
          placeholder={translate('Date range')}
          value={selectedDateRange}
          onChange={(option: DateRangeOption | null) =>
            option && onDaysChange(option.value)
          }
          options={dateRangeOptions}
          isClearable={false}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </Col>
    </Row>
  );
};
