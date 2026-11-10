import { ArrowSquareOutIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { ReactNode, useMemo } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { ExternalLink } from 'waldur-js-client';
import {
  Avatar,
  IconButton,
  Menu,
  SIDEBAR_ICON_BUTTON_CLASSNAME,
} from 'waldur-ui';

import {
  FeatureFlags,
  isMicroAppVisible,
  portalBase,
  ShortcutsViewer,
  useMicroApps,
} from './microApps';

/** One entry of the menu's Apps group. */
export interface AppShortcut {
  key: string;
  title: string;
  description: string;
  href: string;
}

interface UseAppShortcutsOptions {
  /** The app's Vite base URL (`import.meta.env.BASE_URL`). */
  baseUrl: string;
  /** The micro-app showing the menu, by its apps/ name; none in the portal. */
  currentApp?: string;
  /** Null until the user is known: no apps until then. */
  viewer: ShortcutsViewer | null;
  features: FeatureFlags;
  /** The portal's name, for its entry in a micro-app's menu. */
  portalTitle?: string;
}

/**
 * The Apps group: in a micro-app, the portal first, to get back; then the
 * deployment's micro-apps the viewer may see, but not the one they are in.
 */
export const useAppShortcuts = ({
  baseUrl,
  currentApp,
  viewer,
  features,
  portalTitle,
}: UseAppShortcutsOptions): AppShortcut[] => {
  const base = portalBase(baseUrl, currentApp);
  const registry = useMicroApps(base);
  return useMemo(() => {
    if (!viewer) return [];
    const apps: AppShortcut[] = registry
      .filter((app) => app.name !== currentApp)
      .filter((app) => isMicroAppVisible(app, viewer, features))
      .map((app) => ({
        key: app.name,
        title: app.title,
        description: app.description,
        href: `${base}${app.name}/`,
      }));
    if (!currentApp) return apps;
    return [
      {
        key: 'portal',
        title: portalTitle || translate('Portal'),
        description: translate('Back to the full portal.'),
        href: base,
      },
      ...apps,
    ];
  }, [registry, viewer, features, currentApp, base, portalTitle]);
};

const ROW_CLASSNAME = 'relative flex items-center gap-4 py-4 ps-5 pe-1.5';

const ShortcutRow = ({
  title,
  description,
  image,
  trailing,
}: {
  title: string;
  description?: string | null;
  image?: string | null;
  trailing: ReactNode;
}) => (
  <>
    <Avatar name={title} src={image ?? undefined} size={42} />
    {/* A menu item does not wrap (whitespace-nowrap): a long description
        would push the icon out. min-w-0 and whitespace-normal wrap it. */}
    <div className="min-w-0 grow text-base whitespace-normal">
      <div className="font-semibold">{title}</div>
      {description ? (
        <div className="mt-1 font-normal text-quaternary">{description}</div>
      ) : null}
    </div>
    <div className="ms-1.5 shrink-0 text-brand">{trailing}</div>
  </>
);

export interface QuickShortcutsMenuProps {
  apps: AppShortcut[];
  links: ExternalLink[];
  /**
   * Renders the brand row with the menu's trigger in its shortcuts slot
   * (SidebarBrand's `shortcutsButton`), or null when there is nothing to
   * list, so the button is not shown.
   */
  children: (trigger: ReactNode) => ReactNode;
  /** Extra classes for the trigger, e.g. to hide it in a collapsed rail. */
  triggerClassName?: string;
}

/**
 * The quick shortcuts menu left of the logo, shared by the portal and the
 * micro-apps: the deployment's apps above the staff-managed links. Both
 * open in a new tab, marked by the same icon. Either group is left out when
 * empty.
 */
export const QuickShortcutsMenu = ({
  apps,
  links,
  children,
  triggerClassName,
}: QuickShortcutsMenuProps) => {
  const label = translate('Quick shortcuts');
  const trigger =
    apps.length > 0 || links.length > 0 ? (
      <Menu.Trigger asChild>
        <IconButton
          icon={<SquaresFourIcon size={24} weight="bold" />}
          label={label}
          variant="base"
          className={`${SIDEBAR_ICON_BUTTON_CLASSNAME} ${triggerClassName ?? ''}`}
        />
      </Menu.Trigger>
    ) : null;

  return (
    <Menu>
      {children(trigger)}
      <Menu.Content
        look="actions"
        // 400px, but on a phone the screen's width less a 16px margin on
        // each side, which collisionPadding keeps the menu inside.
        collisionPadding={16}
        className="w-[min(400px,calc(100vw-32px))] overflow-hidden p-0"
      >
        {apps.length > 0 ? (
          <Menu.Group>
            <Menu.Label>{translate('Apps')}</Menu.Label>
            {apps.map((app) => (
              <Menu.Item key={app.key} asChild className={ROW_CLASSNAME}>
                <a href={app.href} target="_blank" rel="noopener noreferrer">
                  <ShortcutRow
                    title={app.title}
                    description={app.description}
                    trailing={<ArrowSquareOutIcon size={24} weight="bold" />}
                  />
                </a>
              </Menu.Item>
            ))}
          </Menu.Group>
        ) : null}
        {apps.length > 0 && links.length > 0 ? <Menu.Separator /> : null}
        {links.length > 0 ? (
          <Menu.Group>
            {apps.length > 0 ? (
              <Menu.Label>{translate('Links')}</Menu.Label>
            ) : null}
            {links.map((link) => (
              <Menu.Item key={link.uuid} asChild className={ROW_CLASSNAME}>
                <a href={link.link} target="_blank" rel="noopener noreferrer">
                  <ShortcutRow
                    title={link.name}
                    description={link.description}
                    image={link.image}
                    trailing={<ArrowSquareOutIcon size={24} weight="bold" />}
                  />
                </a>
              </Menu.Item>
            ))}
          </Menu.Group>
        ) : null}
      </Menu.Content>
    </Menu>
  );
};
