import { FunctionComponent, useCallback } from 'react';
import { useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { fixURL } from '@waldur/core/api';
import { Link } from '@waldur/core/Link';
import { useLayout } from '@waldur/metronic/layout/core';

import { themeSelector } from '../theme/store';

export const BrandName: FunctionComponent = () => {
  const theme = useSelector(themeSelector);
  const sidebarTheme = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';
  const layout = useLayout();
  // switch aside.minimized to keep sidebar state between pages
  const toggleSidebar = useCallback(() => {
    layout.setLayout({
      aside: {
        ...layout.config.aside,
        minimized: !layout.config.aside.minimized,
      },
    });
  }, [layout]);

  const sidebarLogoUrl = fixURL('/icons/sidebar_logo/');
  const sidebarLogoMobileUrl = fixURL('/icons/sidebar_logo_mobile/');
  const sidebarLogoDarkUrl = fixURL('/icons/sidebar_logo_dark/');
  const sidebarLogo =
    (theme === 'dark' || sidebarTheme === 'dark') &&
    ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_DARK
      ? sidebarLogoDarkUrl
      : ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO
        ? sidebarLogoUrl
        : undefined;

  return (
    <div
      className="aside-logo flex-column-auto position-relative"
      id="kt_aside_logo"
    >
      <Link state="profile.details">
        {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE && sidebarLogo ? (
          <>
            <img
              src={sidebarLogoMobileUrl}
              alt="logo"
              className="mh-50px mw-200px logo_mobile"
            />
            <img
              src={sidebarLogo}
              alt="logo"
              className="mh-50px mw-200px logo"
            />
          </>
        ) : sidebarLogo ? (
          <img src={sidebarLogo} alt="logo" className="mh-50px mw-200px logo" />
        ) : (
          <h3 className="mt-2">{ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}</h3>
        )}
      </Link>
      <div
        id="kt_aside_toggle"
        className="btn btn-icon btn-sm btn-active-color-primary h-30px w-30px activee"
        data-kt-toggle="true"
        data-kt-toggle-state="active"
        data-kt-toggle-target="body"
        data-kt-toggle-name="aside-minimize"
        aria-hidden="true"
        onClick={toggleSidebar}
      >
        <span className="svg-icon svg-icon-1x">
          <svg
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.125 5.75V19.25C22.125 19.7473 21.9275 20.2242 21.5758 20.5758C21.2242 20.9275 20.7473 21.125 20.25 21.125H3.75C3.25272 21.125 2.77581 20.9275 2.42417 20.5758C2.07254 20.2242 1.875 19.7473 1.875 19.25V5.75C1.875 5.25272 2.07254 4.77581 2.42417 4.42417C2.77581 4.07254 3.25272 3.875 3.75 3.875H20.25C20.7473 3.875 21.2242 4.07254 21.5758 4.42417C21.9275 4.77581 22.125 5.25272 22.125 5.75ZM19.875 6.125H7.875V18.875H19.875V6.125Z"
              fill="currentColor"
            />
            <path
              d="M14.9262 12.5L17.5784 10.3784C17.8114 10.192 17.9608 9.92056 17.9936 9.62396C18.0265 9.32736 17.9402 9.02985 17.7537 8.79687C17.5673 8.5639 17.2959 8.41454 16.9993 8.38167C16.7027 8.34879 16.4052 8.43508 16.1722 8.62156L12.4222 11.6216C12.2904 11.727 12.1841 11.8606 12.111 12.0127C12.038 12.1647 12 12.3313 12 12.5C12 12.6687 12.038 12.8353 12.111 12.9873C12.1841 13.1394 12.2904 13.273 12.4222 13.3784L16.1722 16.3784C16.2875 16.4708 16.4199 16.5395 16.5619 16.5806C16.7038 16.6218 16.8524 16.6346 16.9993 16.6183C17.1461 16.6021 17.2883 16.557 17.4178 16.4858C17.5473 16.4145 17.6614 16.3185 17.7537 16.2031C17.8461 16.0878 17.9148 15.9554 17.9559 15.8134C17.9971 15.6715 18.0099 15.5229 17.9936 15.376C17.9774 15.2292 17.9323 15.087 17.8611 14.9575C17.7898 14.8281 17.6938 14.7139 17.5784 14.6216L14.9262 12.5Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </div>
    </div>
  );
};
