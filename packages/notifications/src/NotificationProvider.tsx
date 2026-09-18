import { CSSProperties, FunctionComponent, useSyncExternalStore } from 'react';
import { Toast, ToastProvider, ToastViewport } from 'waldur-ui';

import { toastStore } from './toastStore';

export interface NotificationProviderProps {
  /** Forwarded to ToastViewport — override to sit above/below a consuming
   * app's own legacy z-index stack; ToastViewport's own z-50 default is
   * otherwise a reasonable value for an app with no such stack. */
  viewportClassName?: string;
  viewportStyle?: CSSProperties;
}

/**
 * Mounts the toast stack. Render once, anywhere in the tree — it doesn't
 * need to wrap the rest of the app (NotifyService/useNotify read and write
 * toastStore directly, not through this component's own React tree), the
 * same way waldur-homeport's own ModalRoot/DrawerRoot are standalone
 * siblings of UIView rather than its ancestor.
 */
export const NotificationProvider: FunctionComponent<
  NotificationProviderProps
> = ({ viewportClassName, viewportStyle }) => {
  const items = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
  );

  return (
    <ToastProvider swipeDirection="right">
      {items.map((item) => (
        <Toast
          key={item.id}
          open={item.open}
          onOpenChange={(open) => {
            if (!open) toastStore.dismiss(item.id);
          }}
          variant={item.variant}
          title={item.title}
          message={item.message}
          actions={item.actions}
          duration={item.duration}
        />
      ))}
      <ToastViewport className={viewportClassName} style={viewportStyle} />
    </ToastProvider>
  );
};
