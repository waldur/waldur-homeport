import {
  CardsThreeIcon,
  CoinsIcon,
  FileTextIcon,
  FolderIcon,
  GaugeIcon,
  GearIcon,
  HandCoinsIcon,
  ListBulletsIcon,
  ReceiptIcon,
  SquaresFourIcon,
  UsersIcon,
  UsersThreeIcon,
  WrenchIcon,
} from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { SidebarNavItem, SidebarSection } from 'waldur-ui';

interface ModeNavProps {
  mode: string;
  projectsCount: ReactNode;
}

/**
 * The sidebar nav for whichever mode the switcher currently has selected.
 *
 * Only two of the eight modes have a real nav mockup: 'finance-reporting'
 * (the current sidebar mockup) and 'organisation-admin' (the earlier one
 * this app rendered before it). Every other mode falls back to Overview
 * alone rather than borrowing another mode's sections — an empty-ish
 * sidebar is honest about "this mode's nav hasn't been designed yet",
 * while showing FINANCE/REPORTS under "End user" would look like a real
 * design decision. Fill the rest in as their mockups arrive.
 *
 * None of these items route anywhere — see OrgDashboardMock.tsx's header
 * comment. Switching modes really does swap the nav below, which is what
 * the picker's "a tailored view of Waldur for a specific job" means.
 */
export const ModeNav = ({ mode, projectsCount }: ModeNavProps) => {
  const overview = (
    <SidebarNavItem
      icon={<SquaresFourIcon size={20} weight="bold" />}
      label={translate('Overview')}
      active
    />
  );

  if (mode === 'organisation-admin') {
    return (
      <>
        <SidebarSection label={translate('ORGANISATION')}>
          {overview}
          <SidebarNavItem
            icon={<FolderIcon size={20} weight="bold" />}
            label={translate('Projects')}
            count={projectsCount}
          />
          <SidebarNavItem
            icon={<UsersIcon size={20} weight="bold" />}
            label={translate('Members')}
          />
        </SidebarSection>
        <SidebarSection label={translate('FINANCE')}>
          <SidebarNavItem
            icon={<ReceiptIcon size={20} weight="bold" />}
            label={translate('Invoices')}
          />
          <SidebarNavItem
            icon={<GaugeIcon size={20} weight="bold" />}
            label={translate('Quotas')}
          />
        </SidebarSection>
        <SidebarSection label={translate('ADMIN')}>
          <SidebarNavItem
            icon={<GearIcon size={20} weight="bold" />}
            label={translate('Settings')}
          />
          <SidebarNavItem
            icon={<ListBulletsIcon size={20} weight="bold" />}
            label={translate('Audit log')}
          />
        </SidebarSection>
      </>
    );
  }

  if (mode === 'finance-reporting') {
    return (
      <>
        {/* No label on the first section — the mockup puts Overview
            directly under the mode card, above the first heading. */}
        <SidebarSection>{overview}</SidebarSection>
        <SidebarSection label={translate('FINANCE')}>
          <SidebarNavItem
            icon={<HandCoinsIcon size={20} weight="bold" />}
            label={translate('Revenue')}
          />
          <SidebarNavItem
            icon={<CoinsIcon size={20} weight="bold" />}
            label={translate('Costs')}
          />
          <SidebarNavItem
            icon={<ReceiptIcon size={20} weight="bold" />}
            label={translate('Pricelist')}
          />
        </SidebarSection>
        <SidebarSection label={translate('REPORTS')}>
          <SidebarNavItem
            icon={<CardsThreeIcon size={20} weight="bold" />}
            label={translate('Resources')}
          />
          <SidebarNavItem
            icon={<WrenchIcon size={20} weight="bold" />}
            label={translate('Providers')}
          />
          <SidebarNavItem
            icon={<UsersThreeIcon size={20} weight="bold" />}
            label={translate('Users')}
          />
          <SidebarNavItem
            icon={<GearIcon size={20} weight="bold" />}
            label={translate('Operations')}
          />
          <SidebarNavItem
            icon={<FileTextIcon size={20} weight="bold" />}
            label={translate('Proposals')}
          />
        </SidebarSection>
      </>
    );
  }

  return <SidebarSection>{overview}</SidebarSection>;
};
