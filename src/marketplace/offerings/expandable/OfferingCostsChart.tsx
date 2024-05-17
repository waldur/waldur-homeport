import { FunctionComponent, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { formValueSelector } from 'redux-form';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { RootState } from '@waldur/store/reducers';

import { getProviderOfferingCostChartData } from './api';
import { OFFERING_CUSTOMERS_LIST_FILTER } from './constants';
import { OfferingCustomersListFilter } from './OfferingCustomersListFilter';
import { formatOfferingCostsChart } from './utils';

const getAccountingRunningFieldValue = (state, formId) =>
  formValueSelector(formId)(state, 'accounting_is_running');

interface OfferingCostChartProps {
  offering: Offering;
}

export const OfferingCostsChart: FunctionComponent<OfferingCostChartProps> = (
  props,
) => {
  const uniqueFormId = useMemo(
    () => `${OFFERING_CUSTOMERS_LIST_FILTER}-${props.offering.uuid}`,
    [props.offering],
  );
  const accountRunningState = useSelector((state: RootState) =>
    getAccountingRunningFieldValue(state, uniqueFormId),
  );

  const {
    loading,
    error,
    value: option,
  } = useAsync(
    () =>
      getProviderOfferingCostChartData(
        accountRunningState?.value,
        props.offering.uuid,
      ).then(formatOfferingCostsChart),
    [accountRunningState, props.offering],
  );

  return (
    <Card className="mb-10">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>{translate('Offering cost chart')}</Card.Title>
        <div className="card-toolbar">
          <OfferingCustomersListFilter uniqueFormId={uniqueFormId} />
        </div>
      </Card.Header>
      <Card.Body className="mt-3 p-m">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>{translate('Unable to load offering cost chart.')}</>
        ) : (
          <EChart options={option} height="400px" />
        )}
      </Card.Body>
    </Card>
  );
};
