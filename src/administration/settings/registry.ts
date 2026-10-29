import { states as administrationStates } from '@/administration/routes';
import { getKeyTitle } from '@/administration/settings/utils';
import { StateDeclaration } from '@/core/types';
import { isFeatureVisible } from '@/features/connect';
import { FeaturesDescription } from '@/features/FeaturesDescription';
import {
  CustomerFeatures,
  MarketplaceFeatures,
  ProjectFeatures,
  ResellerFeatures,
  SupportFeatures,
  UserFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getMarketplaceTitle } from '@/marketplace/title';
import { SettingsDescription } from '@/SettingsDescription';
import { RootState } from '@/store/reducers';
import { isStaff, isStaffOrSupport } from '@/workspace/selectors';

interface SettingItemDescription {
  key: string;
  description: string;
  default: unknown;
  type: string;
  options?: Array<{ value: string; label: string }>;
  fields?: Record<string, unknown>;
}

export interface AdminRegistryLocation {
  state: string;
  params?: Record<string, string>;
  category: string;
  pageTitle: string;
  tabTitle?: string;
  dialogTitle?: string;
  feature?: string;
  permissions?: Array<(state: RootState) => boolean>;
}

export interface SearchableAdminItem {
  id: string;
  kind: 'setting' | 'feature' | 'page';
  key?: string;
  title: string;
  description?: string;
  groupName: string;
  location: AdminRegistryLocation;
  settingMeta?: SettingItemDescription;
}

// Plugin sections grouped into the "Plugins" tab on the Features page
export const FEATURE_PLUGIN_SECTION_KEYS = ['openstack', 'rancher'];

export const getSettingGroupLocations = (): Record<
  string,
  AdminRegistryLocation
> => {
  const uiCategory = translate('User interface');
  const configCategory = translate('Configuration');
  const marketplaceCategory = getMarketplaceTitle();
  const orgComplianceCategory = translate('Organizations & compliance');
  const sysManagementCategory = translate('System management');

  const brandingPage = translate('Branding');
  const marketplaceSettingsPage = translate('Settings');
  const callManagementPage = translate('Call management');
  const identityPage = translate('Identity providers');
  const serviceDeskPage = translate('Service desk settings');
  const softwareCatalogPage = translate('Software catalog');
  const orgProjectSettingsPage = translate('Organization & project settings');
  const databasePage = translate('Database');
  const loggingTelemetryPage = translate('Logging & telemetry');

  return {
    // Branding (User interface › Branding)
    [translate('Branding')]: {
      state: 'admin-branding',
      params: { tab: 'branding' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Branding'),
    },
    [translate('Marketplace Branding')]: {
      state: 'admin-branding',
      params: { tab: 'marketplace' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Marketplace Branding'),
    },
    [translate('Notifications')]: {
      state: 'admin-branding',
      params: { tab: 'notifications' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Notifications'),
    },
    [translate('Links')]: {
      state: 'admin-branding',
      params: { tab: 'links' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Links'),
    },
    [translate('Theme')]: {
      state: 'admin-branding',
      params: { tab: 'theme' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Theme'),
    },
    [translate('About us page')]: {
      state: 'admin-branding',
      params: { tab: 'about-us' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('About us page'),
    },
    [translate('Login page')]: {
      state: 'admin-branding',
      params: { tab: 'login-page' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Login page'),
    },
    [translate('Images')]: {
      state: 'admin-branding',
      params: { tab: 'images' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Images'),
    },
    [translate('Table settings')]: {
      state: 'admin-branding',
      params: { tab: 'table' },
      category: uiCategory,
      pageTitle: brandingPage,
      tabTitle: translate('Table settings'),
    },

    // Languages (User interface › Languages)
    [translate('Localization')]: {
      state: 'admin-languages',
      category: uiCategory,
      pageTitle: translate('Languages'),
    },

    // Marketplace settings (Marketplace › Settings)
    [translate('Marketplace visibility & access')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'visibility' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Visibility & Access'),
    },
    [translate('Marketplace notifications')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'notifications' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Notifications'),
    },
    [translate('Offerings & orders')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'offerings' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Offerings & Orders'),
    },
    [translate('Marketplace development')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'development' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Development'),
    },
    [translate('Affiliates')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'affiliates' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Affiliates'),
    },
    [translate('VAT')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'vat' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('VAT'),
    },
    [translate('SLURM Policy')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'slurm-policy' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('SLURM policy'),
    },
    [translate('Custom Metrics')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'custom-metrics' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Custom metrics'),
    },
    [translate('Usage Polling')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'usage-polling' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('Usage polling'),
    },
    [translate('POSIX ID pools')]: {
      state: 'admin-marketplace-settings',
      params: { tab: 'posix-id-pools' },
      category: marketplaceCategory,
      pageTitle: marketplaceSettingsPage,
      tabTitle: translate('POSIX ID pools'),
    },

    // Software catalog (Marketplace › Software catalog)
    [translate('Software catalog general')]: {
      state: 'admin-software-catalog-settings',
      params: { tab: 'general' },
      category: marketplaceCategory,
      pageTitle: softwareCatalogPage,
      tabTitle: translate('General'),
      feature: MarketplaceFeatures.display_software_catalog,
    },
    [translate('Software catalog EESSI')]: {
      state: 'admin-software-catalog-settings',
      params: { tab: 'eessi' },
      category: marketplaceCategory,
      pageTitle: softwareCatalogPage,
      tabTitle: 'EESSI',
      feature: MarketplaceFeatures.display_software_catalog,
    },
    [translate('Software catalog Spack')]: {
      state: 'admin-software-catalog-settings',
      params: { tab: 'spack' },
      category: marketplaceCategory,
      pageTitle: softwareCatalogPage,
      tabTitle: 'Spack',
      feature: MarketplaceFeatures.display_software_catalog,
    },

    // Call management (Configuration › Call management)
    [translate('Proposal settings')]: {
      state: 'admin-call-management-settings',
      params: { tab: 'proposal' },
      category: configCategory,
      pageTitle: callManagementPage,
      tabTitle: translate('Proposal'),
      feature: MarketplaceFeatures.show_call_management_functionality,
    },
    [translate('ORCID integration settings')]: {
      state: 'admin-call-management-settings',
      params: { tab: 'orcid' },
      category: configCategory,
      pageTitle: callManagementPage,
      tabTitle: translate('ORCID integration'),
      feature: MarketplaceFeatures.show_call_management_functionality,
    },
    [translate('Publication API settings')]: {
      state: 'admin-call-management-settings',
      params: { tab: 'publication' },
      category: configCategory,
      pageTitle: callManagementPage,
      tabTitle: translate('Publication API'),
      feature: MarketplaceFeatures.show_call_management_functionality,
    },

    // Identity & Authentication (Configuration › Identity providers)
    [translate('Authentication settings')]: {
      state: 'admin-identity',
      params: { tab: 'authentication' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('Authentication'),
    },
    [translate('Invitation settings')]: {
      state: 'admin-identity',
      params: { tab: 'invitations' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('Invitations'),
    },
    [translate('User profile settings')]: {
      state: 'admin-identity',
      params: { tab: 'profile' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('User profile'),
    },
    [translate('Data privacy settings')]: {
      state: 'admin-identity',
      params: { tab: 'privacy' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('Data privacy'),
    },
    [translate('API token authentication')]: {
      state: 'admin-identity',
      params: { tab: 'api-auth' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('API authentication'),
    },
    [translate('SCIM Entitlements (outbound push)')]: {
      state: 'admin-identity',
      params: { tab: 'scim' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('SCIM'),
    },
    [translate('SCIM Identity Provider')]: {
      state: 'admin-identity',
      params: { tab: 'scim' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('SCIM'),
    },
    [translate('Identity Bridge')]: {
      state: 'admin-identity',
      params: { tab: 'identity-bridge' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('Identity Bridge'),
      feature: UserFeatures.show_identity_bridge,
    },
    [translate('FreeIPA settings')]: {
      state: 'admin-identity',
      params: { tab: 'providers' },
      category: configCategory,
      pageTitle: identityPage,
      tabTitle: translate('Providers'),
      dialogTitle: 'FreeIPA',
    },

    // Service desk (Configuration › Service desk settings)
    [translate('Service desk integration settings')]: {
      state: 'admin-service-desk-settings',
      params: { tab: 'configuration' },
      category: configCategory,
      pageTitle: serviceDeskPage,
      tabTitle: translate('Configuration'),
    },
    // Provider settings are edited in a dialog opened from the Credentials tab
    [translate('Atlassian settings')]: {
      state: 'admin-service-desk-settings',
      params: { tab: 'credentials' },
      category: configCategory,
      pageTitle: serviceDeskPage,
      tabTitle: translate('Credentials'),
      dialogTitle: 'Atlassian',
    },
    [translate('Zammad settings')]: {
      state: 'admin-service-desk-settings',
      params: { tab: 'credentials' },
      category: configCategory,
      pageTitle: serviceDeskPage,
      tabTitle: translate('Credentials'),
      dialogTitle: 'Zammad',
    },
    [translate('SMAX settings')]: {
      state: 'admin-service-desk-settings',
      params: { tab: 'credentials' },
      category: configCategory,
      pageTitle: serviceDeskPage,
      tabTitle: translate('Credentials'),
      dialogTitle: 'SMAX',
    },

    // Other Configuration pages
    [translate('Custom Scripts')]: {
      state: 'admin-custom-scripts-settings',
      category: configCategory,
      pageTitle: translate('Custom scripts'),
    },
    [translate('AI assistant settings')]: {
      state: 'admin-ai-assistant-settings',
      category: configCategory,
      pageTitle: translate('AI Assistant settings'),
      feature: SupportFeatures.enable_llm_assistant,
    },
    [translate('User Actions')]: {
      state: 'admin-user-actions-settings',
      category: configCategory,
      pageTitle: translate('User actions'),
      feature: UserFeatures.pending_user_actions,
    },
    [translate('SSH keys')]: {
      state: 'admin-ssh-keys-settings',
      category: configCategory,
      pageTitle: translate('SSH key settings'),
      feature: UserFeatures.ssh_keys,
    },
    [translate('Personal Access Tokens')]: {
      state: 'admin-personal-access-tokens-settings',
      category: configCategory,
      pageTitle: translate('Personal access tokens'),
    },
    [translate('MCP server')]: {
      state: 'admin-personal-access-tokens-settings',
      category: configCategory,
      pageTitle: translate('Personal access tokens'),
    },
    [translate('Reporting')]: {
      state: 'admin-reporting-settings',
      category: configCategory,
      pageTitle: translate('Reporting settings'),
    },
    [translate('Matrix chat')]: {
      state: 'admin-matrix-chat',
      params: { tab: 'settings' },
      category: configCategory,
      pageTitle: translate('Matrix chat'),
      tabTitle: translate('Settings'),
      feature: ProjectFeatures.show_matrix_chat,
      // The dashboard shows its Settings tab to staff only
      permissions: [isStaff],
    },
    [translate('Arrow Integration')]: {
      state: 'admin-arrow',
      params: { tab: 'settings' },
      category: configCategory,
      pageTitle: translate('Arrow Integration'),
      tabTitle: translate('Sync settings'),
      feature: ResellerFeatures.arrow,
      permissions: [isStaff],
    },

    // Organizations & compliance
    [translate('Onboarding settings')]: {
      state: 'admin-organization-project-settings',
      params: { tab: 'onboarding' },
      category: orgComplianceCategory,
      pageTitle: orgProjectSettingsPage,
      tabTitle: translate('Onboarding'),
      feature: CustomerFeatures.show_onboarding,
    },
    [translate('Project')]: {
      state: 'admin-organization-project-settings',
      params: { tab: 'project' },
      category: orgComplianceCategory,
      pageTitle: orgProjectSettingsPage,
      tabTitle: translate('Project'),
    },
    [translate('Project Digest')]: {
      state: 'admin-organization-project-settings',
      params: { tab: 'project-digest' },
      category: orgComplianceCategory,
      pageTitle: orgProjectSettingsPage,
      tabTitle: translate('Project digest'),
    },

    // System management
    [translate('Table Growth Monitoring')]: {
      state: 'admin-database',
      params: { tab: 'settings' },
      category: sysManagementCategory,
      pageTitle: databasePage,
      tabTitle: translate('Growth settings'),
    },
    [translate('System Logging')]: {
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
      category: sysManagementCategory,
      pageTitle: loggingTelemetryPage,
      tabTitle: translate('System logging'),
    },
    [translate('Site Agent Logs')]: {
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
      category: sysManagementCategory,
      pageTitle: loggingTelemetryPage,
      tabTitle: translate('System logging'),
    },
    [translate('User Revision History')]: {
      state: 'admin-logging-telemetry',
      params: { tab: 'system-logging' },
      category: sysManagementCategory,
      pageTitle: loggingTelemetryPage,
      tabTitle: translate('System logging'),
    },
    [translate('Telemetry')]: {
      state: 'admin-logging-telemetry',
      params: { tab: 'telemetry' },
      category: sysManagementCategory,
      pageTitle: loggingTelemetryPage,
      tabTitle: translate('Telemetry'),
    },
  };
};

export const getFeatureLocation = (
  sectionKey: string,
  sectionDescription?: string,
): AdminRegistryLocation => {
  const isPluginSection = FEATURE_PLUGIN_SECTION_KEYS.includes(sectionKey);
  const tabKey = isPluginSection ? 'plugins' : sectionKey;
  const tabTitle = isPluginSection
    ? translate('Plugins')
    : sectionDescription || sectionKey;

  return {
    state: 'admin-features',
    params: { tab: tabKey },
    category: translate('User interface'),
    pageTitle: translate('Features'),
    tabTitle,
  };
};

export const getSettingLocation = (
  keyOrGroup: string,
): AdminRegistryLocation | undefined => {
  const groupLocations = getSettingGroupLocations();
  if (groupLocations[keyOrGroup]) {
    return groupLocations[keyOrGroup];
  }
  for (const group of SettingsDescription) {
    if (group.items.some((item) => item.key === keyOrGroup)) {
      return groupLocations[group.description];
    }
  }
  return undefined;
};

export const isAdminLocationAccessible = (
  location: AdminRegistryLocation,
  state: RootState,
): boolean => {
  if (!isStaffOrSupport(state)) {
    return false;
  }
  if (location.feature && !isFeatureVisible(location.feature as any)) {
    return false;
  }
  if (
    location.permissions &&
    !location.permissions.every((check) => Boolean(check(state)))
  ) {
    return false;
  }
  return true;
};

export const formatAdminLocationBreadcrumb = (
  location: AdminRegistryLocation,
): string => {
  const parts = [location.category, location.pageTitle];
  if (location.tabTitle && location.tabTitle !== location.pageTitle) {
    parts.push(location.tabTitle);
  }
  if (location.dialogTitle) {
    parts.push(location.dialogTitle);
  }
  return parts.filter(Boolean).join(' › ');
};

const getCategoryForParentState = (parentName?: string): string => {
  switch (parentName) {
    case 'admin-system-management':
      return translate('System management');
    case 'admin-user-interface':
      return translate('User interface');
    case 'admin-configuration':
      return translate('Configuration');
    case 'admin-organizations-compliance':
      return translate('Organizations & compliance');
    case 'admin-marketplace':
      return getMarketplaceTitle();
    default:
      return translate('Administration');
  }
};

const getAdminPageLocations = (): AdminRegistryLocation[] => {
  const pages: AdminRegistryLocation[] = [];

  for (const route of administrationStates as StateDeclaration[]) {
    if (
      route.abstract ||
      route.redirectTo ||
      route.data?.skipBreadcrumb ||
      !route.data?.breadcrumb
    ) {
      continue;
    }
    const pageTitle = route.data.breadcrumb();
    const category = getCategoryForParentState(route.parent as string);
    pages.push({
      state: route.name,
      category,
      pageTitle,
      feature: route.data?.feature,
      permissions: route.data?.permissions,
    });
  }

  return pages;
};

export const getSearchableAdminItems = (
  state: RootState,
): SearchableAdminItem[] => {
  if (!isStaffOrSupport(state)) {
    return [];
  }

  const items: SearchableAdminItem[] = [];
  const groupLocations = getSettingGroupLocations();

  // 1. Administration pages
  for (const pageLocation of getAdminPageLocations()) {
    if (!isAdminLocationAccessible(pageLocation, state)) {
      continue;
    }
    items.push({
      id: `page:${pageLocation.state}`,
      kind: 'page',
      title: pageLocation.pageTitle,
      description: formatAdminLocationBreadcrumb(pageLocation),
      groupName: pageLocation.category,
      location: pageLocation,
    });
  }

  // 2. Constance settings from SettingsDescription
  for (const group of SettingsDescription) {
    const baseLocation = groupLocations[group.description];
    if (!baseLocation || !isAdminLocationAccessible(baseLocation, state)) {
      continue;
    }
    for (const item of group.items) {
      items.push({
        id: `setting:${item.key}`,
        kind: 'setting',
        key: item.key,
        title: getKeyTitle(item.key),
        description: item.description,
        groupName: group.description,
        location: {
          ...baseLocation,
          params: {
            ...baseLocation.params,
            setting: item.key,
          },
        },
        settingMeta: item as SettingItemDescription,
      });
    }
  }

  // 3. Feature toggles from FeaturesDescription
  for (const section of FeaturesDescription) {
    const baseLocation = getFeatureLocation(section.key, section.description);
    if (!isAdminLocationAccessible(baseLocation, state)) {
      continue;
    }
    for (const item of section.items) {
      const featureKey = `${section.key}.${item.key}`;
      items.push({
        id: `feature:${featureKey}`,
        kind: 'feature',
        key: featureKey,
        title: item.description,
        description: `${section.description} (${featureKey})`,
        groupName: section.description,
        location: {
          ...baseLocation,
          params: {
            ...baseLocation.params,
            setting: featureKey,
          },
        },
      });
    }
  }

  return items;
};

const scoreAdminItemMatch = (item: SearchableAdminItem, q: string): number => {
  const titleLower = item.title.toLowerCase();
  const keyLower = item.key?.toLowerCase() || '';
  const groupLower = item.groupName.toLowerCase();
  const descLower = item.description?.toLowerCase() || '';
  const breadcrumbLower = formatAdminLocationBreadcrumb(
    item.location,
  ).toLowerCase();

  // Exact match on key or title
  if (keyLower === q || titleLower === q) {
    return 100;
  }
  // Prefix match on key or title
  if (keyLower.startsWith(q) || titleLower.startsWith(q)) {
    return 85;
  }
  // Substring match on key or title
  if (keyLower.includes(q) || titleLower.includes(q)) {
    return item.kind === 'page' ? 75 : 70;
  }
  // Match on group name or location breadcrumb
  if (groupLower.includes(q) || breadcrumbLower.includes(q)) {
    return 50;
  }
  // Substring match on description
  if (descLower.includes(q)) {
    return 35;
  }
  // Match on choice options labels
  if (
    item.settingMeta?.options?.some(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        String(opt.value).toLowerCase().includes(q),
    )
  ) {
    return 20;
  }
  return 0;
};

export const searchAdminRegistry = (
  query: string,
  state: RootState,
): SearchableAdminItem[] => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [];
  }

  const allItems = getSearchableAdminItems(state);
  const scored: Array<{ item: SearchableAdminItem; score: number }> = [];

  for (const item of allItems) {
    const score = scoreAdminItemMatch(item, q);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.item.title.localeCompare(b.item.title);
  });

  return scored.map((entry) => entry.item);
};
