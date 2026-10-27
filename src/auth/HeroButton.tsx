import { buttonVariants, cn } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

export const HeroButton = () =>
  ENV.plugins.WALDUR_CORE.HERO_LINK_URL ? (
    <a
      className={cn(buttonVariants({ variant: 'primary' }), 'mt-2.5 font-bold')}
      href={ENV.plugins.WALDUR_CORE.HERO_LINK_URL}
    >
      {ENV.plugins.WALDUR_CORE.HERO_LINK_LABEL || translate('Learn more')}
    </a>
  ) : null;
