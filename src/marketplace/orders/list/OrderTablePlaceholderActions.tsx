import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { canUseMarketplaceShopUi } from '@/marketplace/canUseMarketplaceShopUi';
import { useUser } from '@/workspace/hooks';

export const OrderTablePlaceholderActions = () => {
  const user = useUser();
  if (!canUseMarketplaceShopUi(user)) {
    return null;
  }
  return (
    <Link
      state="public.marketplace-landing"
      buttonVariant="primary"
      className="w-175px mw-350px"
    >
      {translate('Go to marketplace')}
    </Link>
  );
};
