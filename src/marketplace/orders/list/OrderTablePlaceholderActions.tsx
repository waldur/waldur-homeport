import { Link } from '@/core/Link';
import { translate } from '@/i18n';

export const OrderTablePlaceholderActions = () => (
  <Link
    state="public.marketplace-landing"
    buttonVariant="primary"
    className="w-175px mw-350px"
  >
    {translate('Go to marketplace')}
  </Link>
);
