import {
  debugEmailConfigRetrieve,
  debugEmailProbe,
  debugEmailSendTest,
} from 'waldur-js-client';

export type { EmailDiagnostics, EmailFinding } from 'waldur-js-client';

export const getEmailDiagnostics = () =>
  debugEmailConfigRetrieve().then((response) => response.data);

export const probeSmtpConnection = () =>
  debugEmailProbe().then((response) => response.data);

export const sendTestEmail = (email?: string) =>
  debugEmailSendTest({ body: email ? { email } : {} }).then(
    (response) => response.data,
  );
