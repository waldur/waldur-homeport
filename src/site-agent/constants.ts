export const SITE_AGENT_PLUGIN = 'Marketplace.SiteAgent';

// Former name of the site-agent offering type. Recognised when the backend
// returns it, never sent: requests use SITE_AGENT_PLUGIN.
export const LEGACY_SITE_AGENT_PLUGIN = 'Marketplace.Slurm';

export const isSiteAgentOfferingType = (type?: string | null): boolean =>
  type === SITE_AGENT_PLUGIN || type === LEGACY_SITE_AGENT_PLUGIN;
