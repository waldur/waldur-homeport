import copy from 'copy-to-clipboard';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { AuthService } from '@waldur/auth/AuthService';
import { ENV } from '@waldur/configs/default';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { showSuccess } from '@waldur/store/notify';
import './FooterLinks.scss';

const SupportSubMenuItem = ({ title, onCopy }) =>
  title && (
    <span className="menu-link px-2" onClick={() => onCopy(title)}>
      <span className="menu-title">{title}</span>
      <span className="menu-badge">
        <button className="btn btn-active-icon-primary btn-flush ms-2">
          <i className="fa fa-copy" />
        </button>
      </span>
    </span>
  );

export const FooterLinks = () => {
  const dispatch = useDispatch();

  const showSupport =
    ENV.plugins.WALDUR_CORE.DOCS_URL ||
    ENV.plugins.WALDUR_CORE.SITE_EMAIL ||
    ENV.plugins.WALDUR_CORE.SITE_PHONE;

  const copyText = useCallback(
    (text) => {
      copy(text);
      dispatch(showSuccess(translate('{text} has been copied', { text })));
    },
    [dispatch],
  );

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <ul
      className="menu menu-gray-600 menu-hover-primary fw-bold order-1"
      data-kt-menu="true"
    >
      {!AuthService.isAuthenticated() && (
        <li className="menu-item">
          <Link className="menu-link px-2" state="public.marketplace-landing">
            {translate('Explore marketplace')}
          </Link>
        </li>
      )}
      <li className="menu-item">
        <Link className="menu-link px-2" state="about.privacy">
          {translate('Privacy policy')}
        </Link>
      </li>
      <li className="menu-item">
        <Link className="menu-link px-2" state="about.tos">
          {translate('Terms of service')}
        </Link>
      </li>
      {showSupport && (
        <li
          data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
          data-kt-menu-placement="top-end"
          className="menu-item"
        >
          <a className="menu-link px-2">
            <span className="menu-title">{translate('Support')}</span>
            <span className="menu-arrow"></span>
          </a>
          <div className="menu-sub menu-sub-dropdown p-2">
            <DocsLink />
            <SupportSubMenuItem
              title={ENV.plugins.WALDUR_CORE.SITE_EMAIL}
              onCopy={copyText}
            />
            <SupportSubMenuItem
              title={ENV.plugins.WALDUR_CORE.SITE_PHONE}
              onCopy={copyText}
            />
          </div>
        </li>
      )}
    </ul>
  );
};
