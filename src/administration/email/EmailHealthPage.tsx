import { PaperPlaneTiltIcon, PlugsConnectedIcon } from '@phosphor-icons/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { AlertItem } from '@/core/AlertItem';
import { lazyComponent } from '@/core/lazyComponent';
import { Link } from '@/core/Link';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { RefreshButton } from '@/marketplace/common/RefreshButton';
import { useModal } from '@/modal/actions';

import { getEmailDiagnostics, probeSmtpConnection } from './api';
import { EmailConfigCard } from './EmailConfigCard';
import { EmailFindingsCard } from './EmailFindingsCard';
import { getRequestErrorMessage } from './utils';

const SendTestEmailDialog = lazyComponent(() =>
  import('./SendTestEmailDialog').then((module) => ({
    default: module.SendTestEmailDialog,
  })),
);

const SUMMARY: Record<
  string,
  { variant: 'info' | 'warning' | 'error'; title: () => string }
> = {
  OK: {
    variant: 'info',
    title: () => translate('Email delivery looks correctly configured'),
  },
  WARNING: {
    variant: 'warning',
    title: () => translate('Email delivery may not work'),
  },
  ERROR: {
    variant: 'error',
    title: () => translate('Email delivery is broken'),
  },
};

export const EmailHealthPage: FC = () => {
  const { openDialog } = useModal();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['EmailDiagnostics'],
    queryFn: getEmailDiagnostics,
  });
  const probe = useMutation({ mutationFn: probeSmtpConnection });

  // A probe result describes the configuration it ran against. Once the
  // operator has fixed the relay and reloaded the audit, leaving the old
  // verdict on screen would contradict the findings beside it.
  const reload = () => {
    probe.reset();
    return refetch();
  };

  const title = translate('Email configuration');

  if (isLoading) {
    return (
      <Panel title={title} cardBordered>
        <LoadingSpinner
          helpText={translate('Checking the outgoing mail configuration...')}
        />
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel title={title} cardBordered>
        <LoadingErred
          message={translate('Unable to load the email configuration')}
          loadData={refetch}
        />
      </Panel>
    );
  }

  const summary = SUMMARY[data.status] ?? SUMMARY.WARNING;

  return (
    <Panel
      title={title}
      actions={
        <div className="d-flex align-items-center gap-4">
          <RefreshButton refetch={reload} isLoading={isRefetching} />
          <SubmitButton
            submitting={probe.isPending}
            type="button"
            variant="tertiary"
            onClick={() => probe.mutate()}
            label={translate('Test connection')}
            iconNode={<PlugsConnectedIcon weight="bold" />}
            iconOnLeft
          />
          <SubmitButton
            submitting={false}
            type="button"
            variant="primary"
            onClick={() => openDialog(SendTestEmailDialog)}
            label={translate('Send test email')}
            iconNode={<PaperPlaneTiltIcon weight="bold" />}
            iconOnLeft
          />
        </div>
      }
      cardBordered
    >
      <AlertItem
        variant={summary.variant}
        className="mb-6"
        title={summary.title()}
        body={
          <>
            {translate(
              'Two independent things must both be right before anything is sent: a relay that accepts mail from this installation, and at least one enabled notification type.',
            )}{' '}
            <Link state="support-notification-messages">
              {translate('Manage notifications')}
            </Link>
          </>
        }
      />

      {probe.isError && (
        <AlertItem
          variant="error"
          className="mb-6"
          title={translate('The connection test could not be run')}
          body={getRequestErrorMessage(probe.error)}
        />
      )}
      {probe.data &&
        (probe.data.success ? (
          <AlertItem
            variant="info"
            className="mb-6"
            title={translate('The relay answered')}
            body={translate(
              'The connection was opened in {latency} ms. This proves the API service reaches the relay; notifications are sent by the Celery workers, which may reach the network differently.',
              { latency: probe.data.latency_ms },
            )}
          />
        ) : (
          <AlertItem
            variant="error"
            className="mb-6"
            title={translate('The relay could not be reached')}
            body={<code className="text-break">{probe.data.error}</code>}
          />
        ))}

      <EmailFindingsCard findings={data.findings} />
      <EmailConfigCard data={data} />
    </Panel>
  );
};
