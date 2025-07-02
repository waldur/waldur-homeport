import { CopyIcon } from '@phosphor-icons/react';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import * as AuthService from '@waldur/auth/AuthService';
import { ENV } from '@waldur/core/config';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/components';
import { DocsLink } from '@waldur/navigation/header/DocsLink';
import { IssuesLink } from '@waldur/navigation/IssuesLink';
import { showSuccess } from '@waldur/store/notify';

const SupportSubMenuItem = ({ title, onCopy }) =>
  title && (
    <span
      className="menu-link px-2"
      aria-hidden="true"
      onClick={() => onCopy(title)}
    >
      <span className="menu-title">{title}</span>
      <span className="menu-badge">
        <button className="btn btn-active-icon-primary btn-flush ms-2">
          <CopyIcon />
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
      navigator.clipboard.writeText(text).then(() => {
        dispatch(showSuccess(translate('Text has been copied')));
      });
    },
    [dispatch],
  );

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <ul className="menu menu-brand fw-bold order-1" data-kt-menu="true">
      {!AuthService.isAuthenticated() && (
        <>
          {isFeatureVisible(
            MarketplaceFeatures.show_call_management_functionality,
          ) && (
            <li className="menu-item" data-kt-menu-trigger="click">
              <Link
                className="menu-link px-2"
                state="calls-for-proposals-dashboard"
              >
                {translate('Calls for proposals')}
              </Link>
            </li>
          )}
          {ENV.plugins.WALDUR_CORE.ANONYMOUS_USER_CAN_VIEW_OFFERINGS && (
            <li className="menu-item" data-kt-menu-trigger="click">
              <Link
                className="menu-link px-2"
                state="public.marketplace-landing"
              >
                {translate('Explore marketplace')}
              </Link>
            </li>
          )}
        </>
      )}
      <li className="menu-item" data-kt-menu-trigger="click">
        <Link className="menu-link px-2" state="about.privacy">
          {translate('Privacy policy')}
        </Link>
      </li>
      <li className="menu-item" data-kt-menu-trigger="click">
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
          <div className="menu-link px-2">
            <span className="menu-title">{translate('Support')}</span>
            <span className="menu-arrow" />
          </div>
          <div className="menu-sub menu-sub-dropdown p-2">
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
          </div>
        </li>
      )}
    </ul>
  );
};
