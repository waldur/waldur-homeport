import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getAll } from '@waldur/core/api';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Offering, PlanComponent } from '@waldur/marketplace/types';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import exportExcel from '@waldur/table/excel';
import './ExportFullPriceList.scss';

interface ExportFullPriceListProps {
  offering: Offering;
}

const fetchPlanComponents = (offering_uuid: string) =>
  getAll<PlanComponent>('/marketplace-plan-components/', {
    ...ANONYMOUS_CONFIG,
    params: {
      offering_uuid,
    },
  });

const onExport = (offeringName, rows) => {
  const filename = translate('Full price list of {offeringName} offering', {
    offeringName,
  });
  const fields = [
    'Plan name',
    'Component name',
    'Measured unit',
    'Billing type',
    'Billing period',
    'Amount',
    'Component price',
  ];
  const exportRow = (row) => [
    row.plan_name,
    row.component_name,
    row.measured_unit || 'N/A',
    row.billing_type,
    row.plan_unit,
    row.amount,
    row.price,
  ];
  const data = {
    fields,
    data: rows.map((row) => exportRow(row)),
  };
  exportExcel(filename, data);
};

export const ExportFullPriceList: FunctionComponent<
  ExportFullPriceListProps
> = ({ offering }) => {
  const {
    loading,
    error,
    value: components,
  } = useAsync(async () => {
    const components = await fetchPlanComponents(offering.uuid);
    components.map((plan) => {
      if (plan.billing_type !== 'limit') return plan;
      if (plan.amount === 0) plan.amount = 1;
      return plan;
    });
    return components;
  }, [offering]);
  return (
    <div className="exportFullPriceList">
      {loading ? (
        <LoadingSpinnerIcon />
      ) : error ? (
        <>{translate('Unable to load full price list')}</>
      ) : components ? (
        <button
          className="text-anchor exportFullPriceList__download"
          type="button"
          onClick={() => onExport(offering.name, components)}
        >
          <i className="fa fa-download" />
          {translate('Download full price list')}
        </button>
      ) : null}
    </div>
  );
};
