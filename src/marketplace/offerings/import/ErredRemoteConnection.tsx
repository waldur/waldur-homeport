import { AlertItem } from 'waldur-ui';

export const ErredRemoteConnection = ({ error, message }) => (
  <AlertItem
    variant="error"
    type="floating"
    title={message}
    body={error?.message}
  />
);
