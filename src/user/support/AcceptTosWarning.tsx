import { AlertItem } from 'waldur-ui';

import { translate } from '@/i18n';

interface AcceptTosWarningProps {
  isSelf?: boolean;
  userName?: string;
}

export const AcceptTosWarning = ({
  isSelf = true,
  userName,
}: AcceptTosWarningProps) => (
  <AlertItem
    type="floating"
    variant="warning"
    title={
      isSelf
        ? translate('Action required: Accept terms and conditions')
        : translate('Pending: Terms and conditions not accepted')
    }
    body={
      isSelf
        ? translate(
            'You must accept the Terms of Service and privacy policy to access all features. To accept, please check the box below.',
          )
        : translate(
            '{userName} has not yet accepted the Terms of Service and privacy policy.',
            { userName: userName || translate('This user') },
          )
    }
    // A blocking action, so it keeps the tinted, warning-bordered surface the
    // neutral floating card would otherwise lose.
    className="mb-7 border-2 border-warning-600 bg-warning-50 dark:border-warning-300 dark:bg-warning-900"
    role="alert"
  />
);
