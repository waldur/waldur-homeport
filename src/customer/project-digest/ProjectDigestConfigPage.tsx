import { useQuery } from '@tanstack/react-query';
import { FC, useCallback, useEffect, useState } from 'react';

import {
  BaseButton,
  PropertyCard,
  PropertyList,
  Tooltip,
  PropertyItem,
} from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { useNotify } from '@/store/notify';
import { useCustomer } from '@/workspace/hooks';

import { getProjectDigestConfig, sendTestDigest } from './api';
import {
  DIGEST_FORM_ID,
  DigestFormState,
  ProjectDigestConfigForm,
} from './ProjectDigestConfigForm';
import { ProjectDigestPreviewButton } from './ProjectDigestPreviewButton';
import { ProjectDigestSummaryButton } from './ProjectDigestSummaryButton';

export const ProjectDigestConfigPage: FC = () => {
  const customer = useCustomer();
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
        error,
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
      <PropertyCard
        bordered
        title={translate('Project digest emails')}
        className="mb-4"
        actions={
          <>
            {formState.isEnabled && (
              <BaseButton
                variant="secondary"
                onClick={handleSendTest}
                label={translate('Send test email')}
                size="lg"
              />
            )}
            <Tooltip
              label={
                formState.pristine ? translate('No changes to save') : undefined
              }
            >
              <SubmitButton
                submitting={formState.submitting}
                disabled={formState.pristine}
                form={DIGEST_FORM_ID}
                label={translate('Save')}
              />
            </Tooltip>
            <ProjectDigestPreviewButton />
            <ProjectDigestSummaryButton />
          </>
        }
      >
        <p className="text-quaternary mb-4">
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
      </PropertyCard>

      {config?.last_sent_at && (
        <PropertyCard bordered title={translate('Status')}>
          <PropertyList>
            <PropertyItem
              label={translate('Last sent')}
              value={propVal.date(config.last_sent_at, {
                precision: 'datetime',
              })}
            />
          </PropertyList>
        </PropertyCard>
      )}
    </>
  );
};
