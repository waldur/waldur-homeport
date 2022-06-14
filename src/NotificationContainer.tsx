import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsSystem, {
  bootstrapTheme,
  atalhoTheme,
  dismissNotification,
} from 'reapop';

import { RootState } from './store/reducers';

export const NotificationContainer: FunctionComponent = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: any) => state.notifications);
  const theme = useSelector((state: RootState) => state.theme.theme);
  return (
    <NotificationsSystem
      theme={theme === 'dark' ? atalhoTheme : bootstrapTheme}
      notifications={notifications}
      dismissNotification={(id) => dispatch(dismissNotification(id))}
    />
  );
};
