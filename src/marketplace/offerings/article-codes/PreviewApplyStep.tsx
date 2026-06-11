import { FC, useCallback, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import type { ArticleCodeUpdatePreviewItem } from 'waldur-js-client';
import { marketplaceArticleCodeUpdateApply } from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { PROVIDER_OFFERING_DATA_QUERY_KEY } from '@/marketplace/offerings/constants';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { WizardModal, WizardStepProps } from '@/wizard';

import type { ArticleCodeFormValues } from './types';

const ApplyAction = ({
  rows,
}: {
  rows: ArticleCodeUpdatePreviewItem[];
  refetch: () => void;
}) => {
  const { showSuccess } = useNotify();
  const { values } = useFormState<ArticleCodeFormValues>();

  const applyMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      marketplaceArticleCodeUpdateApply({
        body: {
          search: values.search?.trim(),
          replace: values.replace ?? '',
          component_uuids: rows.map((r) => r.component_uuid),
        },
      }),

    errorMessage: translate('Failed to apply changes'),

    onSuccess: (response) => {
      showSuccess(
        translate('{count} article code(s) updated.', {
          count: response.data?.updated_count ?? rows.length,
        }),
      );
    },

    invalidateQueries: [
      {
        queryKey: [PROVIDER_OFFERING_DATA_QUERY_KEY],
      },
    ],
  });

  const handleApply = useCallback(() => {
    if (rows.length === 0) return;
    applyMutation.mutate();
  }, [rows, applyMutation]);

  return (
    <SubmitButton
      submitting={applyMutation.isPending}
      type="button"
      variant="success"
      onClick={handleApply}
      disabled={rows.length === 0}
      label={translate('Apply changes ({count})', { count: rows.length })}
    />
  );
};

const columns: Column<ArticleCodeUpdatePreviewItem>[] = [
  {
    title: translate('Service provider'),
    render: ({ row }) => <>{row.offering_customer_name}</>,
    id: 'provider',
  },
  {
    title: translate('Offering'),
    render: ({ row }) => <>{row.offering_name}</>,
    id: 'offering',
  },
  {
    title: translate('Component'),
    render: ({ row }) => <>{row.component_name}</>,
    id: 'component',
  },
  {
    title: translate('Type'),
    render: ({ row }) => <code>{row.component_type}</code>,
    id: 'type',
  },
  {
    title: translate('Current code'),
    render: ({ row }) => (
      <code className="text-danger">{row.old_article_code}</code>
    ),
    id: 'old_code',
  },
  {
    title: translate('New code'),
    render: ({ row }) => (
      <code className="text-success">{row.new_article_code}</code>
    ),
    id: 'new_code',
  },
];

export const PreviewApplyStep: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<ArticleCodeFormValues>();
  const previewResults = values.previewResults || [];

  const filter = useMemo(
    () => ({ _key: previewResults.length }),
    [previewResults],
  );

  const tableProps = useTable({
    table: 'articleCodePreview',
    fetchData: createClientPaginatedFetcher(previewResults),
    filter,
  });

  const renderFooter = useCallback(() => null, []);

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('article code changes')}
        enableMultiSelect
        multiSelectActions={ApplyAction}
        rowKey="component_uuid"
      />
    </WizardModal>
  );
};
