import { WarnCard } from '@waldur/core/WarnCard';
import { translate } from '@waldur/i18n';

export const AcceptTosWarning = () => (
  <WarnCard
    title={
      translate('Actions required') +
      ': ' +
      translate('Accept term and conditions')
    }
    description={translate(
      'You must accept the terms of service and privacy policy to access all features. To accept, please check the box below.',
    )}
    className="mt-3"
  />
);
