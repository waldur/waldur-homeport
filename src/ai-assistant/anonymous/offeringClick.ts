import { marketplaceChatClick } from 'waldur-js-client';

const OFFERING_RE = /\/marketplace-public-offering\/([^/?#]+)/;

export const extractOfferingUuidFromHref = (href: string): string | null => {
  const match = OFFERING_RE.exec(href);
  return match ? match[1] : null;
};

/** Attribution is best-effort: a failed click report must never block navigation. */
export const reportAnonymousOfferingClick = async (args: {
  interactionUuid: string;
  feedbackToken: string;
  offeringUuid: string;
}): Promise<void> => {
  try {
    await marketplaceChatClick({
      body: {
        interaction_uuid: args.interactionUuid,
        feedback_token: args.feedbackToken,
        offering_uuid: args.offeringUuid,
      },
    });
  } catch {
    // swallow — attribution is non-critical
  }
};
