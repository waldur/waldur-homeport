import { CopyIcon } from '@phosphor-icons/react';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { DocsLink } from '@/navigation/header/DocsLink';
import { useNotify } from '@/store/notify';

import { FooterDropdown } from './FooterDropdown';
import { IssuesLink } from './IssuesLink';

/**
 * Plain content, not a Radix menu item: this is a repeatable "copy to
 * clipboard" affordance (the user may copy the same value more than
 * once, or copy it and then look at another row), so it must not trigger
 * Radix's default select-and-close behaviour — same reasoning as
 * UserDropdown.tsx's UserToken/UserIpAddress Copy buttons.
 */
const SupportSubMenuItem = ({ title, onCopy }) =>
  title ? (
    <li className="menu-item">
      <button
        type="button"
        className="menu-link px-3 cursor-pointer overflow-hidden"
        onClick={() => onCopy(title)}
      >
        <span className="menu-title text-nowrap text-truncate">{title}</span>
        <span className="menu-badge ms-2">
          <CopyIcon weight="bold" />
        </span>
      </button>
    </li>
  ) : null;

export const SupportMenu = () => {
  const { showSuccess } = useNotify();

  const showSupport = !!(
    ENV.plugins.WALDUR_CORE.DOCS_URL ||
    ENV.plugins.WALDUR_CORE.SITE_EMAIL ||
    ENV.plugins.WALDUR_CORE.SITE_PHONE
  );

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess(translate('Text has been copied'));
    });
  };

  if (!showSupport) return null;

  return (
    <FooterDropdown title={translate('Support')}>
      <IssuesLink />
      <DocsLink />
      <SupportSubMenuItem
        title={ENV.plugins.WALDUR_CORE.SITE_EMAIL}
        onCopy={copyText}
      />
      <SupportSubMenuItem
        title={ENV.plugins.WALDUR_CORE.SITE_PHONE}
        onCopy={copyText}
      />
    </FooterDropdown>
  );
};
