import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';

/**
 * Uses RadixDropdownMenu.Item directly rather than NavMenuItem — see
 * footer/MenuItem.tsx's own comment on the doubled `.menu-item` wrapper
 * this avoids (SupportMenu.tsx renders this as a direct child of
 * FooterDropdown's `<ul>`, alongside footer/MenuItem.tsx's own `<li>`s).
 */
export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <li className="menu-item">
      <RadixDropdownMenu.Item asChild>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="menu-link px-3"
        >
          <span className="menu-title">{translate('Documentation')}</span>
        </a>
      </RadixDropdownMenu.Item>
    </li>
  );
};
