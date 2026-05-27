import {
  CheckCircleIcon,
  ClockCountdownIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useEffect } from 'react';
import NotificationsSystem, { useNotifications } from 'reapop';

import { setGlobalNotify } from '@/store/notify';
import { useTheme } from '@/theme/useTheme';

import { FeaturedIcon } from './core/FeaturedIcon';
import { darkTheme, lightTheme } from './notification/theme';

export const NotificationContainer: FunctionComponent = () => {
  const { notifications, dismissNotification, notify } = useNotifications();
  const { theme } = useTheme();

  useEffect(() => {
    setGlobalNotify(notify);
    return () => setGlobalNotify(null);
  }, [notify]);

  return (
    <NotificationsSystem
      theme={theme === 'dark' ? darkTheme : lightTheme}
      notifications={notifications}
      dismissNotification={(id) => dismissNotification(id)}
      components={{
        NotificationIcon: (props) => (
          <div style={props.theme.notificationIcon(props.notification)}>
            {/* eslint-disable waldur-custom/enforce-phosphor-icon-weight */}
            {props.notification.status === 'success' ? (
              <FeaturedIcon IconComponent={CheckCircleIcon} variant="success" />
            ) : props.notification.status === 'warning' ? (
              <FeaturedIcon
                IconComponent={WarningCircleIcon}
                variant="warning"
              />
            ) : props.notification.status === 'error' ? (
              <FeaturedIcon
                IconComponent={WarningOctagonIcon}
                variant="danger"
              />
            ) : props.notification.status === 'info' ? (
              <FeaturedIcon IconComponent={InfoIcon} variant="dark" />
            ) : props.notification.status === 'loading' ? (
              <FeaturedIcon IconComponent={ClockCountdownIcon} variant="dark" />
            ) : null}
            {/* eslint-enable waldur-custom/enforce-phosphor-icon-weight */}
          </div>
        ),
      }}
    />
  );
};
