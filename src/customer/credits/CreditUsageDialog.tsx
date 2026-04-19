import { DateTime } from 'luxon';
import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  InvoiceItem,
  invoiceItemsList,
  InvoiceItemsListData,
  invoiceItemsTotalPriceRetrieve,
} from 'waldur-js-client';

import { parseDate } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { createFetcher } from '@waldur/table/api';
import {
  CreditUsageFilter,
  selectCreditUsageFilter,
} from '@waldur/table/generated/CreditUsageFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

interface CreditUsageDialogProps {
  creditUuid: string;
  scope: 'customer' | 'project';
  customerUuid?: string;
  projectUuid?: string;
  customerName?: string;
  projectName?: string;
}

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 6; i++) {
    const year = currentYear - i;
    years.push({ label: year.toString(), value: year });
  }
  return years;
};

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: DateTime.local()
    .set({ month: i + 1 })
    .toFormat('LLLL'),
  value: i + 1,
}));

export const CreditUsageDialog: FC<CreditUsageDialogProps> = (props) => {
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const formValues = useSelector(selectCreditUsageFilter);

  const filter = useMemo(() => {
    const result: InvoiceItemsListData['query'] = {
      ...(props.scope === 'project'
        ? { project_uuid: props.projectUuid }
        : { credit_uuid: props.creditUuid, customer_uuid: props.customerUuid }),
      ...formValues,
    };

    return result;
  }, [
    props.scope,
    props.creditUuid,
    props.customerUuid,
    props.projectUuid,
    formValues,
  ]);

  const tableProps = useTable({
    table: 'credit-usage-' + props.creditUuid,
    filter,
    fetchData: createFetcher(invoiceItemsList),
    queryField: 'query',
  });

  const title = translate('{scopeName} credit usage history', {
    scopeName:
      props.scope === 'customer' ? props.customerName : props.projectName,
  });

  useEffect(() => {
    invoiceItemsTotalPriceRetrieve({
      query: filter,
    })
      .then((response) => {
        const price =
          typeof response.data.total_price === 'string'
            ? parseFloat(response.data.total_price)
            : response.data.total_price;

        setTotalPrice(isNaN(price) ? 0 : price);
      })
      .catch(() => {
        setTotalPrice(0);
      });
  }, [filter]);

  const footer = (
    <div className="d-flex justify-content-end">
      <strong>
        {translate('Total price')}: {defaultCurrency(totalPrice)}
      </strong>
    </div>
  );

  return (
    <ModalDialog headerLess bodyClassName="p-0">
      <Table<InvoiceItem>
        {...tableProps}
        columns={[
          {
            title: translate('Name'),
            render: ({ row }) => (
              <>
                <div>
                  <strong>
                    {row.details.offering_component_name || row.name}
                  </strong>{' '}
                </div>
                {row.article_code && (
                  <div>
                    <small>
                      {translate('Article code')}: {row.article_code}
                    </small>
                  </div>
                )}
              </>
            ),
          },
          {
            title: translate('Resource'),
            render: ({ row }) => renderFieldOrDash(row.details?.resource_name),
            filter: 'resource',
          },
          {
            title: translate('Offering'),
            render: ({ row }) => renderFieldOrDash(row.details?.offering_name),
            filter: 'offering',
          },
          {
            title: translate('Year'),
            render: ({ row }) => parseDate(row.start).year,
            filter: 'year',
          },
          {
            title: translate('Month'),
            render: ({ row }) => parseDate(row.start).month,
            filter: 'month',
          },
          {
            title: translate('Amount'),
            render: ({ row }) => <>{defaultCurrency(row.unit_price)}</>,
          },
        ]}
        filters={
          <CreditUsageFilter
            customerUUID={props.customerUuid}
            yearOptions={generateYearOptions()}
            monthOptions={MONTH_OPTIONS}
          />
        }
        hasQuery={true}
        title={title}
        initialPageSize={5}
        showPageSizeSelector
        footer={footer}
      />
    </ModalDialog>
  );
};
