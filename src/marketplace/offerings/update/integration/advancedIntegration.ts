import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { isSiteAgentOfferingType } from '@/site-agent/constants';

// FirecREST fronts the SLURM clusters the site agent manages.
export const isHpcWorkspaceConfigurable = (offering): boolean =>
  isSiteAgentOfferingType(offering?.type);

/**
 * Whether an offering has an Advanced integration tab. Kept apart from the
 * section so the offering page can ask without loading it.
 */
export const isAdvancedIntegrationVisible = (offering): boolean =>
  Boolean(
    offering?.plugin_options?.service_provider_can_create_offering_user ||
    isFeatureVisible(MarketplaceFeatures.lexis_links) ||
    isHpcWorkspaceConfigurable(offering),
  );
