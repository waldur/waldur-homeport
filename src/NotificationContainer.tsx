import {
  CheckCircleIcon,
  ClockCountdownIcon,
  InfoIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, useEffect } from 'react';
import NotificationsSystem, { useNotifications } from 'reapop';

import { FeaturedIcon } from 'waldur-ui';

import { setGlobalNotify } from '@/store/notify';
import { useTheme } from '@/theme/useTheme';

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
            {props.notification.status === 'success' ? (
              <FeaturedIcon
                icon={<CheckCircleIcon weight="bold" />}
                variant="success"
              />
            ) : props.notification.status === 'warning' ? (
              <FeaturedIcon
                icon={<WarningCircleIcon weight="bold" />}
                variant="warning"
              />
            ) : props.notification.status === 'error' ? (
              <FeaturedIcon
                icon={<WarningOctagonIcon weight="bold" />}
                variant="danger"
              />
            ) : props.notification.status === 'info' ? (
              <FeaturedIcon
                icon={<InfoIcon weight="bold" />}
                variant="neutral"
              />
            ) : props.notification.status === 'loading' ? (
              <FeaturedIcon
                icon={<ClockCountdownIcon weight="bold" />}
                variant="neutral"
              />
            ) : null}
          </div>
        ),
      }}
    />
  );
};
