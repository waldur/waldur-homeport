import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getAll } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import exportExcel from '@waldur/table/excel';
import { LoadingSpinner } from '@waldur/table/TableLoadingSpinnerContainer';
import './ExportFullPriceList.scss';

interface ExportFullPriceListProps {
  offering: Offering;
}

const fetchPlanComponents = (offering_uuid: string) =>
  getAll('/marketplace-plan-components/', {
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

export const ExportFullPriceList: FunctionComponent<ExportFullPriceListProps> =
  ({ offering }) => {
    const {
      loading,
      error,
      value: components,
    } = useAsync(() => fetchPlanComponents(offering.uuid), [offering]);
    return (
      <div className="exportFullPriceList">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>{translate('Unable to load full price list')}</>
        ) : components ? (
          <div
            className="exportFullPriceList__download"
            onClick={() => onExport(offering.name, components)}
          >
            <i className="fa fa-download" />
            {translate('Download full price list')}
          </div>
        ) : null}
      </div>
    );
  };
