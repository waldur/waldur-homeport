import { FC, memo, useCallback, useMemo } from 'react';
import { marketplaceOfferingTermsOfServiceList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { TosViewDialog } from '@/marketplace/offerings/update/tos/shared/TosViewDialog';
import { useModal } from '@/modal/actions';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RevokeTosAction } from './RevokeTosAction';
import { ViewTosAction } from './ViewTosAction';

interface OfferingTosTableProps {
  offering: { uuid: string; name: string };
  onTosAction?: () => void;
}

export const OfferingTosTable: FC<OfferingTosTableProps> = memo(
  ({ offering, onTosAction }) => {
    const { openDialog } = useModal();

    const filter = useMemo(
      () => ({ offering_uuid: offering.uuid, is_active: true }),
      [],
    );

    const tableProps = useTable({
      table: 'OfferingTos-' + offering.uuid,
      fetchData: createFetcher(marketplaceOfferingTermsOfServiceList),
      filter,
    });

    const handleRefetch = useCallback(() => {
      tableProps.fetch();
      if (onTosAction) onTosAction();
    }, [tableProps.fetch, onTosAction]);

    const openViewDialog = useCallback(
      (tos) => {
        openDialog(TosViewDialog, {
          resolve: { tos, offering, refetch: handleRefetch },
          size: 'lg',
        });
      },
      [offering, handleRefetch],
    );

    const columns = useMemo(
      () => [
        {
          title: translate('Terms of Service'),
          render: ({ row }) => (
            <div>
              <button
                type="button"
                className="text-anchor d-block text-start"
                onClick={() => openViewDialog(row)}
              >
                {row.version || 'v1.0'}
                <span className="text-anchor small d-block mt-2">
                  {formatDate(row.created)}
                </span>
              </button>
            </div>
          ),
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <StateIndicator
              variant={row.has_user_consent ? 'success' : 'danger'}
              label={
                row.has_user_consent
                  ? translate('Accepted')
                  : translate('Not Accepted')
              }
              size="sm"
              pill
              outline
              hasBullet
            />
          ),
        },
        {
          title: translate('Actions'),
          render: ({ row }) => (
            <ActionsDropdown {...({ drop: 'end' } as any)}>
              <ViewTosAction
                tos={row}
                offering={offering}
                refetch={handleRefetch}
              />
              {row.has_user_consent && (
                <RevokeTosAction
                  tos={row}
                  offering={offering}
                  refetch={handleRefetch}
                  offeringUuid={offering.uuid}
                />
              )}
            </ActionsDropdown>
          ),
        },
      ],
      [offering, handleRefetch, openViewDialog],
    );

    return (
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('Terms of Service')}
        hasActionBar={false}
        hoverShadow={false}
        minHeight="auto"
        initialPageSize={5}
      />
    );
  },
);
