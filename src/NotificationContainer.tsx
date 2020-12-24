import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NotificationsSystem, {
  bootstrapTheme,
  dismissNotification,
} from 'reapop';

export const NotificationContainer: FunctionComponent = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: any) => state.notifications);
  return (
    <NotificationsSystem
      theme={bootstrapTheme}
      notifications={notifications}
      dismissNotification={(id) => dispatch(dismissNotification(id))}
    />
  );
};
