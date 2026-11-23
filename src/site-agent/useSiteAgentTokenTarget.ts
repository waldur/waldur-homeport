import { useQuery } from '@tanstack/react-query';
import {
  PatTemplateTarget,
  personalAccessTokensTemplatesList,
  personalAccessTokensTemplateTargetsList,
} from 'waldur-js-client';

import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { SITE_AGENT_TEMPLATE } from '@/user/personal-access-tokens/wizard/tokenPayload';

/**
 * The offering as a site-agent token target, or null when the user cannot
 * create a working token for it. Only an offering's own managers can: the
 * backend lists the offering when their role there holds what the agent
 * needs.
 */
const fetchSiteAgentTokenTarget = async (
  offeringUuid: string,
): Promise<PatTemplateTarget | null> => {
  const templates = (await personalAccessTokensTemplatesList()).data ?? [];
  if (!templates.some((t) => t.key === SITE_AGENT_TEMPLATE)) {
    return null;
  }
  const res = await personalAccessTokensTemplateTargetsList({
    query: { template: SITE_AGENT_TEMPLATE, uuid: offeringUuid },
  });
  return res.data?.[0] ?? null;
};

export const useSiteAgentTokenTarget = (offeringUuid: string) =>
  useQuery({
    queryKey: ['site-agent-token-target', offeringUuid],
    queryFn: () => fetchSiteAgentTokenTarget(offeringUuid),
    // Not being able to tell leaves the action off, which is what it should do.
    retry: false,
    meta: OWN_ERROR_STATE,
  });
