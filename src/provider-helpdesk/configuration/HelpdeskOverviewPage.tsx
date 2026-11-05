import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import {
  BaseButton,
  PropertyItem,
  PropertyList,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { useCustomer } from '@/workspace/hooks';

import { useValidateHelpdesk } from '../api';
import {
  BACKEND_TYPE_STATES,
  getHelpdeskUrl,
  HELPDESK_HEALTH_META,
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

  return (
    <Card bordered>
      <CardHeader className="flex justify-between items-center">
        <CardTitle as="div">{translate('Helpdesk overview')}</CardTitle>
        <BaseButton
          label={translate('Validate')}
          iconNode={<ArrowsClockwiseIcon weight="bold" />}
          variant="tertiary"
          onClick={() => validateMutation.mutate({ uuid: helpdesk.uuid })}
          size="lg"
        />
      </CardHeader>
      <CardContent>
        <PropertyList variant="summary" termWidth="sm" hideIfEmpty={false}>
          <PropertyItem
            label={translate('Technology')}
            value={propVal.state(helpdesk.backend_type, {
              states: BACKEND_TYPE_STATES,
            })}
            className="text-sm"
          />
          <PropertyItem
            label={translate('API URL')}
            className="text-sm"
            value={
              url && (
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {url}
                </a>
              )
            }
          />
          <PropertyItem
            label={translate('Health')}
            value={propVal.state(helpdesk.health_status, {
              states: HELPDESK_HEALTH_META,
            })}
            className="text-sm"
            placeholder={translate('Unknown')}
          />
          <PropertyItem
            label={translate('Last health check')}
            className="text-sm"
            value={propVal.date(helpdesk.last_health_check)}
          />
          <PropertyItem
            label={translate('Notification email')}
            className="text-sm"
            value={helpdesk.notification_email}
          />
          <PropertyItem
            label={translate('Active')}
            className="text-sm"
            value={propVal.boolean(Boolean(helpdesk.is_active), {
              display: 'badge',
            })}
          />
          <PropertyItem
            label={translate('Failed routings')}
            className="text-sm"
            value={propVal.number(helpdesk.failed_routing_count)}
          />
          <PropertyItem
            label={translate('Created')}
            className="text-sm"
            value={propVal.date(helpdesk.created)}
          />
        </PropertyList>
      </CardContent>
    </Card>
  );
};
