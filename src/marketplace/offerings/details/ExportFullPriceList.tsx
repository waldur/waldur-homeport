import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useAsync } from 'react-use';
import {
  marketplacePlanComponentsList,
  PlanComponent,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import exportExcel from '@waldur/table/exporters/excel';

interface ExportFullPriceListProps {
  offering: PublicOfferingDetails;
}

const onExport = (offeringName: string, rows: PlanComponent[]) => {
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

  const exportRow = (row: PlanComponent) => [
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
    const components = await getAllPages((page) =>
      marketplacePlanComponentsList({
        query: {
          page,
          offering_uuid: offering.uuid,
        },
      }),
    );
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
        <Button
          variant="outline btn-outline-default"
          onClick={() => onExport(offering.name, components)}
        >
          <span className="svg-icon svg-icon-2">
            <DownloadSimpleIcon weight="bold" />
          </span>
          {translate('Download full price list')}
        </Button>
      ) : null}
    </div>
  );
};
