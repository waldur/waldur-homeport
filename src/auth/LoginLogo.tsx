import classNames from 'classnames';
import { FC } from 'react';

import { getIconUrl } from '@/core/api';
import { ENV } from '@/core/config';

import './LoginLogo.css';

/**
 * How tall the logo may be on a tall viewport, named after the caps the login
 * layouts each used to set inline: `md` is 80px (seventeen layouts), `sm` is
 * 70px (four) and `lg` is 100px (MinimalLayout). A short viewport steps every
 * size down to 50px, then 35px — which is what the inline caps prevented.
 */
type LoginLogoSize = 'sm' | 'md' | 'lg';

interface LoginLogoProps {
  /** Classes for the wrapper, which is where a layout sets its own margin. */
  className?: string;
  size?: LoginLogoSize;
  /**
   * Language code for a localized logo, which `getIconUrl` turns into
   * `?language=xx`. Only LoginColumn passes one; the layouts in ./layouts
   * never have, so leaving it out keeps each of them on the logo it shows
   * today. Whether they should all localize is a separate question.
   */
  language?: string;
}

/**
 * The deployment's logo at the top of the login page.
 *
 * Owns both the markup and the rules, so a layout only says how tall the logo
 * may be and how much room to leave under it. See LoginLogo.css for why the
 * height cannot be an inline style or a utility.
 */
export const LoginLogo: FC<LoginLogoProps> = ({
  className,
  size = 'md',
  language,
}) => (
  <div className={classNames('login-logo', className)}>
    <img
      alt={ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}
      src={getIconUrl('login_logo', language)}
      className="login-logo-image"
      data-size={size}
    />
  </div>
);
