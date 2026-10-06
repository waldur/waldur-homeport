import { CopyIcon } from '@phosphor-icons/react';

import { Menu } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { DocsLink } from '@/navigation/header/DocsLink';
import { useNotify } from '@/store/notify';

import { FooterDropdown } from './FooterDropdown';
import { IssuesLink } from './IssuesLink';

/**
 * A contact value (the support email or phone) that copies when chosen: a
 * menu item, so arrow keys reach it, that stays open, since the user may
 * copy it more than once or copy it and then look at another row.
 */
const SupportSubMenuItem = ({ title, onCopied }) =>
  title ? (
    <li>
      <Menu.CopyItem
        value={title}
        onCopied={onCopied}
        className="overflow-hidden"
      >
        <span className="grow text-truncate">{title}</span>
        <span className="ms-2 shrink-0" aria-hidden="true">
          <CopyIcon weight="bold" />
        </span>
      </Menu.CopyItem>
    </li>
  ) : null;

export const SupportMenu = () => {
  const { showSuccess } = useNotify();

  const showSupport = !!(
    ENV.plugins.WALDUR_CORE.DOCS_URL ||
    ENV.plugins.WALDUR_CORE.SITE_EMAIL ||
    ENV.plugins.WALDUR_CORE.SITE_PHONE
  );

  const showCopied = () => showSuccess(translate('Text has been copied'));

  if (!showSupport) return null;

  return (
    <FooterDropdown title={translate('Support')}>
      <IssuesLink />
      <DocsLink />
      <SupportSubMenuItem
        title={ENV.plugins.WALDUR_CORE.SITE_EMAIL}
        onCopied={showCopied}
      />
      <SupportSubMenuItem
        title={ENV.plugins.WALDUR_CORE.SITE_PHONE}
        onCopied={showCopied}
      />
    </FooterDropdown>
  );
};
