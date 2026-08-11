export type ChatChannel = 'authenticated' | 'anonymous';

/** One concept, and the field name each channel gives it. */
export interface SharedChatFilter {
  authenticated: string;
  anonymous: string;
}

/**
 * Filters that describe the same thing on both channels, so a scope set on one
 * tab stays true on the other.
 *
 * Left out on purpose: `user` / `user_slug` are different entities — a Waldur
 * account against a salted visitor hash — so carrying one over filters on a
 * value that can never match; and `is_archived` has no anonymous counterpart.
 */
export const SHARED_CHAT_FILTERS: SharedChatFilter[] = [
  { authenticated: 'created_range', anonymous: 'created_range' },
  // The anonymous row is last active, never modified — same column, same
  // meaning, different name (generate-filters-config.yaml:467-469).
  { authenticated: 'modified_range', anonymous: 'last_active_range' },
  { authenticated: 'is_flagged', anonymous: 'is_flagged' },
  { authenticated: 'has_feedback', anonymous: 'has_feedback' },
  // Both render the same InjectionSeverityOptions enum, so the stored option
  // object is valid on either side.
  { authenticated: 'max_severity', anonymous: 'severity' },
  { authenticated: 'input_tokens_range', anonymous: 'input_tokens_range' },
  { authenticated: 'output_tokens_range', anonymous: 'output_tokens_range' },
  { authenticated: 'total_tokens_range', anonymous: 'total_tokens_range' },
];

export const otherChannel = (channel: ChatChannel): ChatChannel =>
  channel === 'authenticated' ? 'anonymous' : 'authenticated';
