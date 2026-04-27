import { ENV } from '@/core/config';
import { translate } from '@/i18n';

export const HeroButton = () =>
  ENV.plugins.WALDUR_CORE.HERO_LINK_URL ? (
    <a
      className="btn btn-primary mt-3"
      style={{ fontWeight: 'bold' }}
      href={ENV.plugins.WALDUR_CORE.HERO_LINK_URL}
    >
      {ENV.plugins.WALDUR_CORE.HERO_LINK_LABEL || translate('Learn more')}
    </a>
  ) : null;
