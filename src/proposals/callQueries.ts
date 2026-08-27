/**
 * Cache key for a partial call fetch.
 *
 * The field selector belongs in the key, not only in the request. Two callers
 * asking for different slices of the same call are asking different questions,
 * and sharing one cache entry hands whichever loses the race a payload without
 * the field it came for — silently, since the field is simply absent rather
 * than wrong.
 *
 * ProjectDetailsStep (`fixed_duration_in_days`) and ProjectDetailsSummary
 * (`proposal_field_config`) render on the same page and did exactly that: the
 * duration went unprefilled, or the configured fields fell back to defaults,
 * depending on which resolved first.
 *
 * Sorted so two callers naming the same fields in a different order still
 * share the entry they should share.
 */
export const publicCallKey = (uuid: string, fields: readonly string[]) =>
  ['Call', uuid, [...fields].sort().join(',')] as const;
