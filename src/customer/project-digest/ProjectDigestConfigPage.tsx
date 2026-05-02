import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@/core/dateUtils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Tip } from '@/core/Tooltip';
import FormTable from '@/form/FormTable';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { useNotify } from '@/store/notify';
import { renderFieldOrDash } from '@/table/utils';
import { getCustomer } from '@/workspace/selectors';

import { getProjectDigestConfig, sendTestDigest } from './api';
import {
  DIGEST_FORM_ID,
  DigestFormState,
  ProjectDigestConfigForm,
} from './ProjectDigestConfigForm';
import { ProjectDigestPreviewButton } from './ProjectDigestPreviewButton';
import { ProjectDigestSummaryButton } from './ProjectDigestSummaryButton';

export const ProjectDigestConfigPage: FC = () => {
  const customer = useSelector(getCustomer);
  const { showErrorResponse, showSuccess } = useNotify();

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
      showErrorResponse(
        error as any,
        translate('Unable to load digest configuration.'),
      );
    }
  }, [error]);

  const handleUpdated = useCallback(() => {
    refetch();
  }, [refetch]);

  const [formState, setFormState] = useState<DigestFormState>({
    submitting: false,
    pristine: true,
    isEnabled: false,
  });

  const handleSendTest = useCallback(async () => {
    try {
      await sendTestDigest(customer.uuid);
      showSuccess(
        translate('Test digest email has been sent to your email address.'),
      );
    } catch (error) {
      showErrorResponse(error, translate('Unable to send test digest email.'));
    }
  }, [error, customer?.uuid]);

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
        actions={
          <>
            {formState.isEnabled && (
              <SubmitButton
                submitting={false}
                type="button"
                variant="secondary"
                onClick={handleSendTest}
                label={translate('Send test email')}
              />
            )}
            <Tip
              label={
                formState.pristine ? translate('No changes to save') : undefined
              }
              id="save-digest-config"
            >
              <SubmitButton
                submitting={formState.submitting}
                disabled={formState.pristine}
                form={DIGEST_FORM_ID}
                label={translate('Save')}
              />
            </Tip>
            <ProjectDigestPreviewButton />
            <ProjectDigestSummaryButton />
          </>
        }
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
          onFormStateChange={setFormState}
        />
      </FormTable.Card>

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
