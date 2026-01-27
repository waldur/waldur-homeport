import { FC, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
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
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { CreditUsageFilter } from './CreditUsageFilter';

interface CreditUsageDialogProps {
  creditUuid: string;
  scope: 'customer' | 'project';
  customerUuid?: string;
  projectUuid?: string;
  customerName?: string;
  projectName?: string;
}

interface CreditUsageFilterValues {
  offering?: { uuid: string };
  resource?: { uuid: string };
  year?: number;
  month?: number;
}

export const CreditUsageDialog: FC<CreditUsageDialogProps> = (props) => {
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const formValues =
    (useSelector((state) =>
      getFormValues('CreditUsageFilter')(state),
    ) as CreditUsageFilterValues) || {};

  const filter = useMemo(() => {
    const result: InvoiceItemsListData['query'] = {
      credit_uuid: props.creditUuid,
      customer_uuid: props.customerUuid,
      project_uuid: props.projectUuid,
    };

    if (formValues?.offering) {
      result.offering_uuid = formValues.offering.uuid;
    }
    if (formValues?.resource) {
      result.resource_uuid = formValues.resource.uuid;
    }
    if (formValues?.year) {
      result.start_year = formValues.year;
    }
    if (formValues?.month) {
      result.start_month = formValues.month;
    }

    return result;
  }, [
    props.creditUuid,
    props.customerUuid,
    props.projectUuid,
    formValues?.offering?.uuid,
    formValues?.resource?.uuid,
    formValues?.year,
    formValues?.month,
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
        filters={<CreditUsageFilter customerUUID={props.customerUuid} />}
        hasQuery={true}
        title={title}
        initialPageSize={5}
        showPageSizeSelector
        footer={footer}
      />
    </ModalDialog>
  );
};
