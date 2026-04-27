import { ENV } from '@/core/config';
import { translate } from '@/i18n';

export const useMarketplaceTitle = (): string => {
  return (
    ENV.plugins.WALDUR_CORE.MARKETPLACE_LANDING_PAGE || translate('Marketplace')
  );
};
