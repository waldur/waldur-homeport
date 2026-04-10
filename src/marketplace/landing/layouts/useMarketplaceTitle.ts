import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';

export const useMarketplaceTitle = (): string => {
  return (
    ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE || translate('Marketplace')
  );
};
