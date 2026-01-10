import { ExportIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Card,
  ToggleButton,
  ToggleButtonGroup,
  Row,
  Col,
} from 'react-bootstrap';
import { checklistsAdminCategoriesList } from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ActionButton } from '@waldur/table/ActionButton';

import { ChecklistUsageAnalyticsTable } from './ChecklistUsageAnalyticsTable';
import { ComplianceByCategoryTable } from './ComplianceByCategoryTable';
import { OrgPerformanceTable } from './OrgPerformanceTable';
import { StatWidgetCard } from './StatWidgetCard';

const periodOptions = [
  { label: translate('{n} days', { n: 7 }), value: 7 },
  { label: translate('1 month'), value: 30 },
  { label: translate('{month} months', { month: 6 }), value: 6 * 30 },
];

const allCategoriesOption = { name: translate('All categories'), url: 'all' };

// Dummy data for top cards and tables (replace with real API calls as needed)
const topCards = [
  {
    label: translate('Average Compliance Rate'),
    value: '73%',
    trend: -2,
  },
  {
    label: translate('Organizations'),
    value: '89',
    trend: 100,
  },
  {
    label: translate('Total Checklists'),
    value: '127',
    trend: 100,
  },
  {
    label: translate('Total Questions'),
    value: '1,847',
    trend: 100,
  },
];

export const AnalyticsAndReports = () => {
  const [category, setCategory] = useState(allCategoriesOption);
  const [period, setPeriod] = useState(
    periodOptions.length > 1
      ? periodOptions[periodOptions.length - 2].value
      : periodOptions[0].value,
  );

  const {
    data: categories = [],
    isLoading,
    error,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['ChecklistCategories'],
    queryFn: () =>
      getAllPages((page) =>
        checklistsAdminCategoriesList({ query: { page_size: 1000, page } }),
      ),
    staleTime: 3 * 60 * 1000,
  });

  return (
    <Card>
      <Card.Header className="mx-0 border-0">
        <Card.Title>
          {error ? (
            <LoadingErred
              message={translate('Unable to load categories')}
              loadData={refetchCategories}
              className="d-flex flex-center gap-4"
            />
          ) : (
            <Select
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              value={category}
              placeholder={translate('All categories')}
              onChange={setCategory}
              options={[allCategoriesOption].concat(categories)}
              isLoading={isLoading}
              className="metronic-select-container min-w-150px min-w-lg-325px"
              classNamePrefix="metronic-select"
            />
          )}
        </Card.Title>
        <div className="card-toolbar gap-4">
          {periodOptions.length > 1 && (
            <ToggleButtonGroup
              type="radio"
              name="period"
              value={period}
              defaultValue={period}
              onChange={setPeriod}
            >
              {periodOptions.map((option) => (
                <ToggleButton
                  key={option.value}
                  id={'tbg-' + option.value}
                  value={option.value}
                  variant="tertiary"
                >
                  {option.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
          <ActionButton
            action={() => {}}
            title={translate('Export report')}
            iconNode={<ExportIcon weight="bold" />}
            variant="tertiary"
          />
        </div>
      </Card.Header>
      <Card.Body className="p-0 overflow-hidden">
        {/* Stat cards */}
        <Row className="mb-5 g-5">
          {topCards.map((card) => (
            <Col key={card.label} xs={12} sm={6} md={3} lg={6} xl={3}>
              <StatWidgetCard
                label={card.label}
                value={card.value}
                changes={card.trend}
              />
            </Col>
          ))}
        </Row>

        {/* Compliance by Category & Checklist Usage Analytics */}
        <Row className="mb-5 g-5">
          <Col md={6} xs={12}>
            <ComplianceByCategoryTable />
          </Col>
          <Col md={6} xs={12}>
            <ChecklistUsageAnalyticsTable />
          </Col>
        </Row>

        {/* Organization Performance Comparison Table */}
        <OrgPerformanceTable />
      </Card.Body>
    </Card>
  );
};
