import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsSystem, {
  atalhoTheme,
  bootstrapTheme,
  dismissNotification,
} from 'reapop';

import { themeSelector } from './navigation/theme/store';

export const NotificationContainer: FunctionComponent = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: any) => state.notifications);
  const theme = useSelector(themeSelector);
  return (
    <NotificationsSystem
      theme={theme === 'dark' ? atalhoTheme : bootstrapTheme}
      notifications={notifications}
      dismissNotification={(id) => dispatch(dismissNotification(id))}
    />
  );
};
