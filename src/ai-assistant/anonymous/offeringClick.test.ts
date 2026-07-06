import { describe, it, expect, vi } from 'vitest';
import { marketplaceChatClick } from 'waldur-js-client';

import {
  extractOfferingUuidFromHref,
  reportAnonymousOfferingClick,
} from './offeringClick';

describe('extractOfferingUuidFromHref', () => {
  it('extracts the uuid from a public offering link', () => {
    expect(
      extractOfferingUuidFromHref('/marketplace-public-offering/abc123/'),
    ).toBe('abc123');
    expect(
      extractOfferingUuidFromHref(
        'https://x/marketplace-public-offering/abc123/',
      ),
    ).toBe('abc123');
  });
  it('returns null for unrelated links', () => {
    expect(extractOfferingUuidFromHref('/projects/1/')).toBeNull();
  });
});

describe('reportAnonymousOfferingClick', () => {
  it('posts the click', async () => {
    vi.mocked(marketplaceChatClick).mockResolvedValue({} as any);
    await reportAnonymousOfferingClick({
      interactionUuid: 'i1',
      feedbackToken: 't1',
      offeringUuid: 'o1',
    });
    expect(marketplaceChatClick).toHaveBeenCalledWith({
      body: {
        interaction_uuid: 'i1',
        feedback_token: 't1',
        offering_uuid: 'o1',
      },
    });
  });
  it('never throws on failure', async () => {
    vi.mocked(marketplaceChatClick).mockRejectedValue(new Error('boom'));
    await expect(
      reportAnonymousOfferingClick({
        interactionUuid: 'i1',
        feedbackToken: 't1',
        offeringUuid: 'o1',
      }),
    ).resolves.toBeUndefined();
  });
});
