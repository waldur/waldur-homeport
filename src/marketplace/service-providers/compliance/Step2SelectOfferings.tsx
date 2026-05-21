import { FC, useMemo } from 'react';
import { marketplaceProviderOfferingsList, Offering } from 'waldur-js-client';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { getLabel } from '@/marketplace/common/registry';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step2SelectOfferings: FC<WizardFormStepProps> = (props) => {
  const filter = useMemo(
    () => ({
      field: ['uuid', 'url', 'name', 'category_title', 'type'],
      customer_uuid: props.data.provider.customer_uuid,
    }),
    [props.data?.provider],
  );

  const tableProps = useTable({
    table: 'OfferingsSelectorTable',
    fetchData: createFetcher(marketplaceProviderOfferingsList),
    filter,
    queryField: 'name',
  });

  return (
    <WizardForm {...props} submitDisabled={tableProps.loading}>
      <Table<Offering>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => row.name,
          },
          {
            title: translate('Type'),
            render: ({ row }) => getLabel(row.type),
          },
          {
            title: translate('Category'),
            render: ({ row }) => row.category_title,
          },
        ]}
        verboseName={translate('Offerings')}
        hasQuery
        hideTitle
        hideRefresh
        headerClassName="px-0"
        cardBordered={false}
        fullWidth
        equalColWidth
        showPageSizeSelector
        fieldName="offerings"
        fieldType="checkbox"
        validate={required}
      />
    </WizardForm>
  );
};
