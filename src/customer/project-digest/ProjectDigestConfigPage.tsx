import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { showErrorResponse } from '@waldur/store/notify';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { getProjectDigestConfig } from './api';
import { ProjectDigestConfigForm } from './ProjectDigestConfigForm';
import { ProjectDigestPreview } from './ProjectDigestPreview';
import { ProjectDigestSummaryButton } from './ProjectDigestSummaryButton';

export const ProjectDigestConfigPage: FC = () => {
  const customer = useSelector(getCustomer);
  const dispatch = useDispatch();

  const {
    data: config,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['ProjectDigestConfig', customer?.uuid],
    queryFn: () =>
      customer?.uuid ? getProjectDigestConfig(customer.uuid) : null,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (error) {
      dispatch(
        showErrorResponse(
          error as any,
          translate('Unable to load digest configuration.'),
        ),
      );
    }
  }, [error, dispatch]);

  const handleUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <LoadingErred loadData={refetch} />;
  }

  return (
    <>
      <FormTable.Card
        title={translate('Project digest emails')}
        className="card-bordered mb-5"
        actions={<ProjectDigestSummaryButton />}
      >
        <p className="text-muted mb-5">
          {translate(
            'Configure periodic email digests sent to project members, summarizing project status including resources, timelines, and team information.',
          )}
        </p>
        <ProjectDigestConfigForm
          config={config}
          customerUuid={customer.uuid}
          onUpdated={handleUpdated}
        />
      </FormTable.Card>

      <ProjectDigestPreview customerUuid={customer.uuid} />

      {config?.last_sent_at && (
        <FormTable.Card title={translate('Status')} className="card-bordered">
          <FormTable>
            <FormTable.Item
              label={translate('Last sent')}
              value={renderFieldOrDash(formatDateTime(config.last_sent_at))}
            />
          </FormTable>
        </FormTable.Card>
      )}
    </>
  );
};
