import { FC } from 'react';

import { AccordionCard, PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import type { EmailDiagnostics } from './api';

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
      className="mb-5"
    >
      <p className="text-quaternary">
        {translate(
          'These settings come from the deployment configuration and cannot be changed here. Edit override.conf.py — the Helm values or the docker-compose .env file — and restart the services.',
        )}
      </p>
      <PropertyList>
        <PropertyItem
          value={propVal.code(config.backend)}
          label={translate('Backend')}
        />
        <PropertyItem value={config.host} label={translate('Relay host')} />
        {/* Text, not Number: a port reads without a thousands separator. */}
        <PropertyItem value={config.port} label={translate('Port')} />
        <PropertyItem value={config.host_user} label={translate('Username')} />
        <PropertyItem
          value={propVal.boolean(config.has_password)}
          label={translate('Password set')}
        />
        <PropertyItem
          value={propVal.boolean(config.use_tls)}
          label={translate('STARTTLS (EMAIL_USE_TLS)')}
        />
        <PropertyItem
          value={propVal.boolean(config.use_ssl)}
          label={translate('Implicit TLS (EMAIL_USE_SSL)')}
        />
        <PropertyItem
          value={propVal.number(config.timeout, { unit: translate('seconds') })}
          label={translate('Timeout')}
        />
        <PropertyItem
          value={config.default_from_email}
          label={translate('Sender address')}
        />
        <PropertyItem
          value={config.default_reply_to_email}
          label={translate('Reply-to address')}
        />
        <PropertyItem
          label={translate('Enabled notifications')}
          value={propVal.meter(
            data.enabled_notification_count,
            data.total_notification_count,
            { showPercent: true },
          )}
        />
        <PropertyItem
          label={translate('Messages sent in the last week')}
          value={propVal.number(data.emails_sent_last_week)}
        />
      </PropertyList>
    </AccordionCard>
  );
};
