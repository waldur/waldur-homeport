import { baseTheme, Notification, STATUSES, Theme } from 'reapop';

const colorPerStatus = {
  [STATUSES.none]: '#ffffff',
  [STATUSES.info]: '#007bff',
  [STATUSES.loading]: '#007bff',
  [STATUSES.success]: '#28a745',
  [STATUSES.warning]: '#ffc107',
  [STATUSES.error]: '#dc3545',
};
const lineHeight = 1.428571429;

export const lightTheme: Theme = {
  ...baseTheme,
  notification: (notification: Notification) => ({
    display: 'flex',
    width: '400px',
    height: '100%',
    position: 'relative',
    // eslint-disable-next-line waldur-custom/enforce-border-radius-tokens
    borderRadius: '8px',
    boxShadow:
      '0 12px 16px -4px rgba(16, 24, 40, .1), 0 4px 6px -2px rgba(16, 24, 40, .05)',
    zIndex: 999,
    backgroundColor: '#ffffff',
    color: '#524c4c',
    marginBottom: '20px',
    cursor:
      notification.dismissible && !notification.showDismissButton
        ? 'pointer'
        : '',
  }),
  notificationIcon: (notification: Notification) => ({
    display: notification.image ? 'none' : 'flex',
    width: '38px',
    height: '38px',
    boxSizing: 'border-box',
    margin: '7px 0 0 7px',
    alignSelf: 'flex-start',
    flexShrink: 0,
    color: colorPerStatus[notification.status],
  }),
  notificationDismissIcon: () => ({
    width: '15px',
    height: '15px',
    margin: '16px 16px 0 0',
    cursor: 'pointer',
    color: '#98a2b3',
    flexShrink: 0,
  }),
  notificationMeta: () => ({
    verticalAlign: 'top',
    boxSizing: 'border-box',
    width: '100%',
    padding: '16px',
    paddingLeft: '11px',
  }),
  notificationTitle: (notification) => ({
    margin: notification.message ? '0 0 4px' : 0,
    fontSize: '14px',
    color: '#101828',
    fontWeight: 600,
    lineHeight,
  }),
  notificationMessage: () => ({
    margin: 0,
    fontSize: '14px',
    color: '#667085',
    lineHeight,
  }),
  notificationImageContainer: () => ({
    boxSizing: 'border-box',
    padding: '10px 0 10px 15px',
  }),
  notificationImage: () => ({
    display: 'inline-flex',
    borderRadius: '40px',
    width: '40px',
    height: '40px',
    backgroundSize: 'cover',
  }),
  notificationButtons: () => ({}),
  notificationButton: (
    notification: Notification,
    position: number,
    state: { isHovered: boolean; isActive: boolean },
  ) => ({
    display: 'block',
    width: '100%',
    height: `${100 / notification.buttons.length}%`,
    minHeight: '40px',
    boxSizing: 'border-box',
    padding: 0,
    background: 'none',
    border: 'none',
    borderRadius: 0,
    borderLeft: '1px solid rgba(0,0,0,.1)',
    outline: 'none',
    textAlign: 'center',
    color: state.isHovered || state.isActive ? '#007bff' : '#212529',
    cursor: 'pointer',
    borderTop: position === 1 ? '1px solid rgba(0, 0, 0, 0.09)' : 'none',
  }),
  notificationButtonText: () => ({
    display: 'block',
    height: '25px',
    padding: '0 15px',
    minWidth: '90px',
    maxWidth: '150px',
    width: 'auto',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    margin: '0 auto',
    textOverflow: 'ellipsis',
    textAlign: 'center',
    fontSize: '14px',
    lineHeight: '25px',
  }),
};

export const darkTheme: Theme = {
  ...lightTheme,
  notification: (notification: Notification) => ({
    ...lightTheme.notification(notification),
    width: '402px',
    backgroundColor: '#0c111d',
    boxShadow:
      '0 12px 16px -4px rgba(6, 8, 14, .35), 0 4px 6px -2px rgba(0, 0, 0, .2)',
    border: '1px solid #1f242f',
  }),
  notificationDismissIcon: (notification) => ({
    ...lightTheme.notificationDismissIcon(notification),
    color: '#85888e',
  }),
  notificationTitle: (notification) => ({
    ...lightTheme.notificationTitle(notification),
    color: '#f5f5f6',
  }),
  notificationMessage: (notification) => ({
    ...lightTheme.notificationMessage(notification),
    color: '#94969c',
  }),
};
