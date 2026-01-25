import { FC } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

interface YearOption {
  value: number;
  label: string;
}

interface UsageTrendsFilterProps {
  year: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export const UsageTrendsFilter: FC<UsageTrendsFilterProps> = ({
  year,
  onYearChange,
  availableYears,
}) => {
  const yearOptions: YearOption[] = availableYears.map((y) => ({
    value: y,
    label: String(y),
  }));

  const selectedYear = yearOptions.find((o) => o.value === year);

  return (
    <Row className="mb-6 g-3">
      <Col xs={12} sm={6} md={4} lg={3}>
        <Select
          placeholder={translate('Select year')}
          value={selectedYear}
          onChange={(option: YearOption | null) =>
            option && onYearChange(option.value)
          }
          options={yearOptions}
          isClearable={false}
          className="metronic-select-container"
          classNamePrefix="metronic-select"
        />
      </Col>
    </Row>
  );
};
