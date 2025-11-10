import { FC, useMemo } from 'react';
import { marketplaceProviderOfferingsList, Offering } from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { getLabel } from '@waldur/marketplace/common/registry';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
    <WizardForm
      {...props}
      submitDisabled={tableProps.loading}
      submitDisabledInvalid
    >
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
