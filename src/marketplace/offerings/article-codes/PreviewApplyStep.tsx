import { useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { useFormState } from 'react-final-form';
import { useDispatch } from 'react-redux';
import type { ArticleCodeUpdatePreviewItem } from 'waldur-js-client';
import { marketplaceArticleCodeUpdateApply } from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { PROVIDER_OFFERING_DATA_QUERY_KEY } from '@waldur/marketplace/offerings/constants';
import { closeModalDialog } from '@waldur/modal/actions';
import { useNotify } from '@waldur/store/hooks';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { WizardModal, WizardStepProps } from '@waldur/wizard';

import type { ArticleCodeFormValues } from './types';

const ApplyAction = ({
  rows,
}: {
  rows: ArticleCodeUpdatePreviewItem[];
  refetch: () => void;
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { showSuccess, showErrorResponse } = useNotify();
  const { values } = useFormState<ArticleCodeFormValues>();
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(async () => {
    if (rows.length === 0) return;
    setApplying(true);
    try {
      const response = await marketplaceArticleCodeUpdateApply({
        body: {
          search: values.search?.trim(),
          replace: values.replace ?? '',
          component_uuids: rows.map((r) => r.component_uuid),
        },
      });
      showSuccess(
        translate('{count} article code(s) updated.', {
          count: response.data?.updated_count ?? rows.length,
        }),
      );
      queryClient.invalidateQueries({
        queryKey: [PROVIDER_OFFERING_DATA_QUERY_KEY],
      });
      dispatch(closeModalDialog());
    } catch (error) {
      showErrorResponse(error, translate('Failed to apply changes'));
    } finally {
      setApplying(false);
    }
  }, [dispatch, queryClient, rows, values, showSuccess, showErrorResponse]);

  return (
    <SubmitButton
      submitting={applying}
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

  const fetchData = useCallback(
    () =>
      Promise.resolve({
        rows: previewResults,
        resultCount: previewResults.length,
      }),
    [previewResults],
  );

  const filter = useMemo(
    () => ({ _key: previewResults.length }),
    [previewResults],
  );

  const tableProps = useTable({
    table: 'articleCodePreview',
    fetchData,
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
