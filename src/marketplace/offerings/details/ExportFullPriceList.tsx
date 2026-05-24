import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import {
  marketplacePlanComponentsList,
  PlanComponent,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ActionButton } from '@/table/ActionButton';
import exportExcel from '@/table/exporters/excel';

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
    isLoading: loading,
    error,
    data: components,
  } = useQuery({
    queryKey: ['ExportFullPriceList', offering],

    queryFn: async () => {
      const components = await getAllPages((page) =>
        marketplacePlanComponentsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
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
    },
  });

  return (
    <div className="exportFullPriceList">
      {loading ? (
        <LoadingSpinnerSimple />
      ) : error ? (
        <>{translate('Unable to load full price list')}</>
      ) : components ? (
        <ActionButton
          variant="tertiary"
          action={() => onExport(offering.name, components)}
          iconNode={<DownloadSimpleIcon weight="bold" />}
          title={translate('Download full price list')}
        />
      ) : null}
    </div>
  );
};
