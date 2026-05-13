import { FC } from 'react';
import { Accordion } from 'react-bootstrap';
import { useFormState } from 'react-final-form';

import { EChart } from '@/core/EChart';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { useCustomerCostChart } from '../dashboard/utils';

import { CustomerCreditFormData } from './types';

export const OrganizationCostChart: FC = () => {
  const { values } = useFormState<CustomerCreditFormData>({
    subscription: { values: true },
  });
  const customer = values.customer;

  const { chart, options, isLoading, error, refetch } =
    useCustomerCostChart(customer);

  if (!customer) return null;

  return (
    <Accordion className="mb-7">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="fw-bolder">
            {translate('Organization invoice history')}
            {isLoading && <LoadingSpinnerSimple className="ms-2" />}
          </div>
        </Accordion.Header>
        <Accordion.Body>
          {error ? (
            <LoadingErred loadData={refetch} />
          ) : options ? (
            <>
              <div className="fw-bold text-muted text-end">
                {translate('Total for the year')}
                {': '}
                {defaultCurrency(chart?.total)}
              </div>
              <EChart options={options} height="150px" />
            </>
          ) : null}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};
