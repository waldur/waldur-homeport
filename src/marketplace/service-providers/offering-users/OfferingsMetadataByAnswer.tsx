import { FC } from 'react';
import {
  ServiceProvider,
  serviceProviderOfferingUsersCompliance,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { MetadataByAnswerExpandableRow } from './MetadataByAnswerExpandableRow';

export const OfferingsMetadataByAnswer: FC<
  TableWithPortal & { provider: ServiceProvider }
> = ({ portal, provider }) => {
  // FIX THIS: api endpoint is wrong
  const tableProps = useTable({
    table: 'OfferingsMetadata-' + provider.uuid,
    fetchData: createFetcher(serviceProviderOfferingUsersCompliance, {
      path: { service_provider_uuid: provider.uuid },
    }),
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Question'),
          render: ({ row }) => row.question_description,
        },
      ]}
      verboseName={translate('Questions')}
      portal={portal}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      hasQuery
      // tableActions={}
      expandableRow={MetadataByAnswerExpandableRow}
    />
  );
};
