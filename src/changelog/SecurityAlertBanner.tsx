import { XIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';

import { AlertItem } from 'waldur-ui';

import { IconButton } from '@/core/buttons/IconButton';
import { translate } from '@/i18n';

import { URGENCY_CONFIG } from './constants';
import { SecurityAlert } from './types';

interface SecurityAlertBannerProps {
  alert: SecurityAlert;
  currentVersion: string;
}

// Keyed on the fixing releases too, so dismissing one alert doesn't also hide
// a different alert of the same urgency that appears later in the session.
const getDismissKey = (alert: SecurityAlert) =>
  `dismissed_security_alert_${alert.max_urgency}_${alert.versions
    .map((v) => v.version)
    .join(',')}`;

const getSummary = (alert: SecurityAlert) => {
  const urgency =
    URGENCY_CONFIG[alert.max_urgency]?.label() ?? alert.max_urgency;
  return alert.count === 1
    ? translate('1 security fix pending, {urgency} urgency.', { urgency })
    : translate('{count} security fixes pending, {urgency} urgency.', {
        count: alert.count,
        urgency,
      });
};

export const SecurityAlertBanner = ({
  alert,
  currentVersion,
}: SecurityAlertBannerProps) => {
  const [dismissed, setDismissed] = useState(() => {
    if (alert.max_urgency === 'critical') return false;
    return sessionStorage.getItem(getDismissKey(alert)) === 'true';
  });

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(getDismissKey(alert), 'true');
    setDismissed(true);
  }, [alert]);

  if (dismissed) return null;
  if (alert.max_urgency !== 'critical' && alert.max_urgency !== 'high')
    return null;

  const isCritical = alert.max_urgency === 'critical';
  const fixedIn = alert.versions.map((v) => v.version).join(', ');

  return (
    <AlertItem
      variant={isCritical ? 'error' : 'warning'}
      type="floating"
      className="mb-2"
      title={
        isCritical
          ? translate('Security alert')
          : translate('Security update available')
      }
      body={
        <>
          <div>{getSummary(alert)}</div>
          <div>
            {translate('Your version ({version}) is affected.', {
              version: currentVersion,
            })}{' '}
            {translate('Fixed in {versions}.', { versions: fixedIn })}
          </div>
        </>
      }
      actions={
        !isCritical && (
          <IconButton
            iconNode={<XIcon weight="bold" />}
            tooltip={translate('Dismiss')}
            onClick={handleDismiss}
            variant="text-primary"
          />
        )
      }
    />
  );
};
