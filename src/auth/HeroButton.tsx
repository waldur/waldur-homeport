import { Button } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const HeroButton = () =>
  ENV.plugins.WALDUR_CORE.HERO_LINK_URL ? (
    <Button
      as="a"
      className="m-t-md"
      style={{ fontWeight: 'bold' }}
      href={ENV.plugins.WALDUR_CORE.HERO_LINK_URL}
    >
      {ENV.plugins.WALDUR_CORE.HERO_LINK_LABEL || translate('Learn more')}
    </Button>
  ) : null;
