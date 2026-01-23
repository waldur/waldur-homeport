import { WarnCard } from '@waldur/core/WarnCard';
import { translate } from '@waldur/i18n';

interface AcceptTosWarningProps {
  isSelf?: boolean;
  userName?: string;
}

export const AcceptTosWarning = ({
  isSelf = true,
  userName,
}: AcceptTosWarningProps) => (
  <WarnCard
    prominent
    title={
      isSelf
        ? translate('Action required: Accept terms and conditions')
        : translate('Pending: Terms and conditions not accepted')
    }
    description={
      isSelf
        ? translate(
            'You must accept the Terms of Service and privacy policy to access all features. To accept, please check the box below.',
          )
        : translate(
            '{userName} has not yet accepted the Terms of Service and privacy policy.',
            { userName: userName || translate('This user') },
          )
    }
    className="mb-7"
  />
);
