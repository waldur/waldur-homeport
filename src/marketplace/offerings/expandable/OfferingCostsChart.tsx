import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FunctionComponent, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { Form, useFormState } from 'react-final-form';
import {
  marketplaceProviderOfferingsCostsList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { EChart } from '@/core/EChart';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import {
  AccountingRunningField,
  getOptions,
} from '@/customer/list/AccountingRunningField';
import { translate } from '@/i18n';

import { formatOfferingCostsChart } from './utils';

interface OfferingCostChartProps {
  offering: Offering;
}

const ChartBody: FunctionComponent<{ offering: Offering }> = ({ offering }) => {
  const { values } = useFormState();
  const accounting_is_running = values?.accounting_is_running?.value;

  const {
    isLoading,
    error,
    data: option,
  } = useQuery({
    queryKey: ['offeringCostsChart', offering.uuid, accounting_is_running],
    queryFn: () =>
      getAllPages((page) =>
        marketplaceProviderOfferingsCostsList({
          path: { uuid: offering.uuid },
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            accounting_is_running,
            start: DateTime.now().minus({ months: 11 }).toFormat('yyyy-MM'),
            end: DateTime.now().toFormat('yyyy-MM'),
          },
        }),
      ).then(formatOfferingCostsChart),
    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load offering cost chart.')}</>
  ) : option ? (
    <EChart options={option} height="400px" />
  ) : null;
};

export const OfferingCostsChart: FunctionComponent<OfferingCostChartProps> = ({
  offering,
}) => {
  const initialValues = useMemo(
    () => ({
      accounting_is_running: getOptions()[0],
    }),
    [],
  );

  return (
    <Form
      onSubmit={() => {}}
      initialValues={initialValues}
      render={({ handleSubmit }) => (
        <form onSubmit={handleSubmit}>
          <Card className="card-bordered mb-10">
            <Card.Header>
              <Card.Title>{translate('Offering cost chart')}</Card.Title>
              <div className="card-toolbar">
                <div className="form-inline min-w-200px">
                  <AccountingRunningField />
                </div>
              </div>
            </Card.Header>
            <Card.Body className="mt-3 p-m">
              <ChartBody offering={offering} />
            </Card.Body>
          </Card>
        </form>
      )}
    />
  );
};
