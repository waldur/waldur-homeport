export const SITE_AGENT_PLUGIN = 'Marketplace.SiteAgent';

// Former name of the site-agent offering type. Recognised when the backend
// returns it, never sent: requests use SITE_AGENT_PLUGIN.
export const LEGACY_SITE_AGENT_PLUGIN = 'Marketplace.Slurm';

export const isSiteAgentOfferingType = (type?: string | null): boolean =>
  type === SITE_AGENT_PLUGIN || type === LEGACY_SITE_AGENT_PLUGIN;

/** Whether the offering's SLURM periodic usage policy can be configured:
 * the switch is on, and the offering has a site agent to apply it. */
export const offersSlurmPeriodicPolicy = (offering: {
  type?: string | null;
  plugin_options?: { slurm_periodic_policy_enabled?: boolean } | null;
}): boolean =>
  isSiteAgentOfferingType(offering.type) &&
  Boolean(offering.plugin_options?.slurm_periodic_policy_enabled);
