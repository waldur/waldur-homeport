import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { FooterDropdownItem } from '@/navigation/footer/FooterDropdownItems';

export const DocsLink: FunctionComponent = () => {
  const link = ENV.plugins.WALDUR_CORE.DOCS_URL;
  if (!link) {
    return null;
  }
  return (
    <FooterDropdownItem asChild>
      <a href={link} target="_blank" rel="noopener noreferrer">
        {translate('Documentation')}
      </a>
    </FooterDropdownItem>
  );
};
