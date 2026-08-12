import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Card } from 'react-bootstrap';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { ActionButton } from '@/table/ActionButton';
import { BooleanField } from '@/table/BooleanField';
import { useCustomer } from '@/workspace/hooks';

import { useValidateHelpdesk } from '../api';
import {
  getBackendLabel,
  getHealthMeta,
  getHelpdeskUrl,
} from '../common/backend';
import { useProviderHelpdesk } from '../common/useProviderHelpdesk';

/**
 * Read-only summary of the provider's helpdesk: which backend technology and
 * URL power it, plus health and notification settings. Editing lives in the
 * Configuration tab; this is the at-a-glance landing view of the workspace.
 */
export const HelpdeskOverviewPage: FC = () => {
  const customer = useCustomer();
  const { helpdesk, isLoading, refetch } = useProviderHelpdesk(
    customer?.service_provider_uuid,
  );
  const validateMutation = useValidateHelpdesk(refetch);

  if (isLoading) {
    return <LoadingSpinner />;
  }
  if (!helpdesk) {
    return null;
  }

  const url = getHelpdeskUrl(helpdesk);
  const health = getHealthMeta(helpdesk.health_status);

  const rows: Array<[string, ReactNode]> = [
    [
      translate('Technology'),
      <Badge variant="secondary" pill outline>
        {getBackendLabel(helpdesk.backend_type)}
      </Badge>,
    ],
    [
      translate('API URL'),
      url ? (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ) : null,
    ],
    [
      translate('Health'),
      <Badge variant={health.variant} pill outline>
        {health.label}
      </Badge>,
    ],
    [
      translate('Last health check'),
      helpdesk.last_health_check
        ? formatDate(helpdesk.last_health_check)
        : null,
    ],
    [translate('Notification email'), helpdesk.notification_email || null],
    [translate('Active'), <BooleanField value={Boolean(helpdesk.is_active)} />],
    [translate('Failed routings'), <>{helpdesk.failed_routing_count}</>],
    [translate('Created'), formatDate(helpdesk.created)],
  ];

  return (
    <Card className="card-bordered">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title>{translate('Helpdesk overview')}</Card.Title>
        <ActionButton
          title={translate('Validate')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          variant="tertiary"
          action={() => validateMutation.mutate({ uuid: helpdesk.uuid })}
        />
      </Card.Header>
      <Card.Body>
        {rows
          .filter(([, value]) => value != null)
          .map(([label, value]) => (
            <Field
              key={label}
              label={label}
              value={value}
              isStuck
              labelClass="min-w-150px"
              className="fs-6"
            />
          ))}
      </Card.Body>
    </Card>
  );
};
