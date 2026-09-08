import { SquaresFourIcon, ArrowSquareOutIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadixToggle from '@radix-ui/react-toggle';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useCallback, useState, useEffect } from 'react';
import { externalLinksList } from 'waldur-js-client';

import { SHORTCUTS_QUERY_KEY } from '@/administration/quick-shortcuts/utils';
import { getIconUrl } from '@/core/api';
import Avatar from '@/core/Avatar';
import { ENV } from '@/core/config';
import { Link } from '@/core/Link';
import { SidebarToggleGraphic } from '@/core/SidebarToggleGraphic';
import { translate } from '@/i18n';
import { useLayout } from '@/metronic/layout/core';
import { useTheme } from '@/theme/useTheme';

interface BrandNameProps {
  isAsideHovered?: boolean;
}

export const BrandName: FunctionComponent<BrandNameProps> = ({
  isAsideHovered = false,
}) => {
  const { theme } = useTheme();
  const configuredStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE || 'dark';
  const sidebarTheme =
    configuredStyle === 'auto'
      ? theme === 'dark'
        ? 'dark'
        : 'light'
      : configuredStyle;
  const layout = useLayout();
  const [userHasToggled, setUserHasToggled] = useState(false);

  // Auto-minimize sidebar for medium screens (768px - 1399px)
  useEffect(() => {
    // Only auto-resize if user hasn't manually toggled
    if (userHasToggled) return;

    const handleResize = () => {
      const width = window.innerWidth;
      const shouldMinimize = width >= 768 && width < 1400;

      if (shouldMinimize && !layout.config.aside.minimized) {
        layout.setLayout({
          aside: {
            ...layout.config.aside,
            minimized: true,
          },
        });
      } else if (
        !shouldMinimize &&
        width >= 1400 &&
        layout.config.aside.minimized
      ) {
        layout.setLayout({
          aside: {
            ...layout.config.aside,
            minimized: false,
          },
        });
      }
    };

    // Check on mount
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout, userHasToggled]);

  const { data: shortcutsResponse } = useQuery({
    queryKey: SHORTCUTS_QUERY_KEY,
    queryFn: () =>
      externalLinksList({ query: { page_size: 50 } }).then(
        (response) => response.data,
      ),
    refetchOnWindowFocus: false,
  });

  const shortcuts = shortcutsResponse || [];

  // switch aside.minimized to keep sidebar state between pages
  const toggleSidebar = useCallback(
    (pressed?: boolean) => {
      setUserHasToggled(true);
      const nextMinimized =
        typeof pressed === 'boolean' ? pressed : !layout.config.aside.minimized;
      layout.setLayout({
        aside: {
          ...layout.config.aside,
          minimized: nextMinimized,
        },
      });
    },
    [layout],
  );

  const sidebarLogoUrl = getIconUrl('sidebar_logo');
  const sidebarLogoMobileUrl = getIconUrl('sidebar_logo_mobile');
  const sidebarLogoDarkUrl = getIconUrl('sidebar_logo_dark');
  const sidebarLogo =
    (sidebarTheme === 'accent' || sidebarTheme === 'dark') &&
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
      {/* Shortcuts Button */}
      <div className="position-relative min-w-24px">
        {shortcuts.length > 0 &&
          (!layout.config.aside.minimized || isAsideHovered) && (
            <RadixDropdownMenu.Root modal={false}>
              <RadixDropdownMenu.Trigger asChild>
                <button
                  className="btn btn-icon btn-sm border-0 w-24px"
                  aria-label={translate('Quick shortcuts')}
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <SquaresFourIcon size={24} weight="bold" />
                </button>
              </RadixDropdownMenu.Trigger>
              <RadixDropdownMenu.Portal>
                <RadixDropdownMenu.Content
                  sideOffset={2}
                  // position-static: same fix as ActionsDropdown.tsx's own
                  // Content -- Bootstrap's .dropdown-menu hardcodes
                  // position: absolute, which fights the Radix popper
                  // wrapper (the actual positioned element here) and
                  // collapses this panel's measured size.
                  className="dropdown-menu show p-0 overflow-hidden position-static"
                  style={{ minWidth: '400px' }}
                >
                  {shortcuts.map((shortcut: any, index: number) => (
                    <RadixDropdownMenu.Item key={shortcut.uuid} asChild>
                      <a
                        href={shortcut.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item d-flex align-items-center py-5 ps-6 pe-2 position-relative"
                      >
                        {/* Show separator line only if there are multiple items and not the last item */}
                        {shortcuts.length > 1 &&
                          index < shortcuts.length - 1 && (
                            <div
                              className="position-absolute bottom-0 start-50 translate-middle-x border-bottom"
                              style={{ width: 'calc(100% - 24px)' }}
                            />
                          )}
                        <div className="me-5">
                          <Avatar
                            name={shortcut.name}
                            src={shortcut.image}
                            circle
                            size={42}
                          />
                        </div>
                        <div className="flex-grow-1 fs-4">
                          <div className="fw-bolder">{shortcut.name}</div>
                          {shortcut.description && (
                            <div className="fw-normal text-muted mt-3">
                              {shortcut.description}
                            </div>
                          )}
                        </div>
                        <div className="ms-2">
                          <span className="svg-icon svg-icon-primary svg-icon-1x">
                            <ArrowSquareOutIcon weight="bold" />
                          </span>
                        </div>
                      </a>
                    </RadixDropdownMenu.Item>
                  ))}
                </RadixDropdownMenu.Content>
              </RadixDropdownMenu.Portal>
            </RadixDropdownMenu.Root>
          )}
      </div>
      {/* Logo */}
      <Link state="profile.details">
        {ENV.plugins.WALDUR_CORE.SIDEBAR_LOGO_MOBILE && sidebarLogo ? (
          <>
            <img
              src={sidebarLogoMobileUrl}
              alt="logo"
              className="logo_mobile"
            />

            <img src={sidebarLogo} alt="logo" className="logo" />
          </>
        ) : sidebarLogo ? (
          <img src={sidebarLogo} alt="logo" className="logo" />
        ) : (
          <h3 className="mt-2">{ENV.plugins.WALDUR_CORE.SHORT_PAGE_TITLE}</h3>
        )}
      </Link>
      {/* Minimizer Toggle */}
      <div className="min-w-24px">
        <RadixToggle.Root
          id="kt_aside_toggle"
          className="btn btn-icon btn-sm border-0 w-24px"
          pressed={Boolean(layout.config.aside.minimized)}
          onPressedChange={toggleSidebar}
          aria-label={
            layout.config.aside.minimized
              ? translate('Expand sidebar')
              : translate('Collapse sidebar')
          }
          style={{ outline: 'none', boxShadow: 'none' }}
        >
          <span className="svg-icon svg-icon-1x">
            <SidebarToggleGraphic width={24} height={25} />
          </span>
        </RadixToggle.Root>
      </div>
    </div>
  );
};
