import { FC } from 'react';

import { AccordionCard } from '@/core/AccordionCard';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import type { EmailDiagnostics } from './api';

const dash = <span className="text-muted">&mdash;</span>;

const yesNo = (value: boolean) => (value ? translate('Yes') : translate('No'));

interface EmailConfigCardProps {
  data: EmailDiagnostics;
}

export const EmailConfigCard: FC<EmailConfigCardProps> = ({ data }) => {
  const { config } = data;
  return (
    <AccordionCard
      id="email-config"
      title={translate('Effective configuration')}
      subtitle={
        config.host
          ? `${config.host}:${config.port}`
          : translate('No relay configured')
      }
      defaultOpen
      className="mb-6"
    >
      <p className="text-muted">
        {translate(
          'These settings come from the deployment configuration and cannot be changed here. Edit override.conf.py — the Helm values or the docker-compose .env file — and restart the services.',
        )}
      </p>
      <FormTable>
        <FormTable.Item label={translate('Backend')} value={config.backend} />
        <FormTable.Item
          label={translate('Relay host')}
          value={config.host || dash}
        />
        <FormTable.Item label={translate('Port')} value={config.port ?? dash} />
        <FormTable.Item
          label={translate('Username')}
          value={config.host_user || dash}
        />
        <FormTable.Item
          label={translate('Password set')}
          value={yesNo(config.has_password)}
        />
        <FormTable.Item
          label={translate('STARTTLS (EMAIL_USE_TLS)')}
          value={yesNo(config.use_tls)}
        />
        <FormTable.Item
          label={translate('Implicit TLS (EMAIL_USE_SSL)')}
          value={yesNo(config.use_ssl)}
        />
        <FormTable.Item
          label={translate('Timeout')}
          value={
            config.timeout
              ? translate('{count} seconds', { count: config.timeout })
              : dash
          }
        />
        <FormTable.Item
          label={translate('Sender address')}
          value={config.default_from_email || dash}
        />
        <FormTable.Item
          label={translate('Reply-to address')}
          value={config.default_reply_to_email || dash}
        />
        <FormTable.Item
          label={translate('Enabled notifications')}
          value={translate('{enabled} of {total}', {
            enabled: data.enabled_notification_count,
            total: data.total_notification_count,
          })}
        />
        <FormTable.Item
          label={translate('Messages sent in the last week')}
          value={data.emails_sent_last_week}
        />
      </FormTable>
    </AccordionCard>
  );
};
