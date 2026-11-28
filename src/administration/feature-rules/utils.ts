import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  FeatureRule,
  featureRulesList,
  metadataFeaturesRetrieve,
} from 'waldur-js-client';

import {
  ClaimRow,
  claimsToRows,
  rowsToClaims,
  toList,
} from '@/administration/auto-provisioning-rules/utils';
import { getAllPages } from '@/core/api';
import { translate } from '@/i18n';

/** Every feature rule, for the counts on the Features and Micro-apps pages. */
export const FEATURE_RULES_QUERY_KEY = ['feature-rules'];

/** The key of the rules that pick a micro-app's audience. */
export const microAppFeatureKey = (name: string) => `micro_apps.${name}`;

interface NamedOption {
  uuid: string;
  name?: string;
  full_name?: string;
  username?: string;
}

export interface FeatureRuleFormValues {
  description?: string;
  is_active: boolean;
  users: NamedOption[];
  customers: NamedOption[];
  organization_groups: NamedOption[];
  roles: string[];
  // `CommaSeparatedListGroup` seeds these from an array and emits one, but a
  // field left untouched may still hold a string (see `toList`).
  user_email_patterns: string | string[];
  user_affiliations: string | string[];
  user_identity_sources: string | string[];
  user_nationalities: string | string[];
  user_organization_types: string | string[];
  user_assurance_levels: string | string[];
  user_claims: ClaimRow[];
}

export const ruleToFormValues = (rule?: FeatureRule): FeatureRuleFormValues =>
  rule
    ? {
        description: rule.description ?? '',
        is_active: rule.is_active ?? true,
        users: rule.users_summary,
        customers: rule.customers_summary,
        organization_groups: rule.organization_groups_summary,
        roles: rule.roles ?? [],
        user_email_patterns: rule.user_email_patterns ?? [],
        user_affiliations: rule.user_affiliations ?? [],
        user_identity_sources: rule.user_identity_sources ?? [],
        user_nationalities: rule.user_nationalities ?? [],
        user_organization_types: rule.user_organization_types ?? [],
        user_assurance_levels: rule.user_assurance_levels ?? [],
        user_claims: claimsToRows(rule.user_claims),
      }
    : {
        is_active: true,
        users: [],
        customers: [],
        organization_groups: [],
        roles: [],
        user_email_patterns: [],
        user_affiliations: [],
        user_identity_sources: [],
        user_nationalities: [],
        user_organization_types: [],
        user_assurance_levels: [],
        user_claims: [],
      };

export const formValuesToPayload = (
  featureKey: string,
  values: FeatureRuleFormValues,
) => ({
  feature_key: featureKey,
  description: values.description ?? '',
  is_active: values.is_active,
  users: (values.users ?? []).map((user) => user.uuid),
  customers: (values.customers ?? []).map((customer) => customer.uuid),
  organization_groups: (values.organization_groups ?? []).map(
    (group) => group.uuid,
  ),
  roles: values.roles ?? [],
  user_email_patterns: toList(values.user_email_patterns, ' '),
  user_affiliations: toList(values.user_affiliations),
  user_identity_sources: toList(values.user_identity_sources),
  user_nationalities: toList(values.user_nationalities),
  user_organization_types: toList(values.user_organization_types),
  user_assurance_levels: toList(values.user_assurance_levels),
  user_claims: rowsToClaims(values.user_claims),
});

/**
 * Whether the form configures any criterion. A rule without one matches no
 * one: turning a feature on for everyone is what its switch is for. The
 * dialog says so rather than refusing it, so a rule left without criteria
 * can still be edited or deactivated.
 */
export const hasCriterion = (values: FeatureRuleFormValues): boolean => {
  const payload = formValuesToPayload('', values);
  return (
    payload.users.length > 0 ||
    payload.customers.length > 0 ||
    payload.organization_groups.length > 0 ||
    payload.roles.length > 0 ||
    payload.user_email_patterns.length > 0 ||
    payload.user_affiliations.length > 0 ||
    payload.user_identity_sources.length > 0 ||
    payload.user_nationalities.length > 0 ||
    payload.user_organization_types.length > 0 ||
    payload.user_assurance_levels.length > 0 ||
    Object.keys(payload.user_claims).length > 0
  );
};

/** One short line per criterion a rule configures, for its table row. */
export const summarizeRule = (rule: FeatureRule): string[] => {
  const lines: string[] = [];
  const names = (items: NamedOption[]) =>
    items
      .map((item) => item.full_name || item.name || item.username)
      .join(', ');
  if (rule.users_summary?.length) {
    lines.push(
      translate('Users: {names}', { names: names(rule.users_summary) }),
    );
  }
  if (rule.customers_summary?.length) {
    lines.push(
      translate('Organizations: {names}', {
        names: names(rule.customers_summary),
      }),
    );
  }
  if (rule.organization_groups_summary?.length) {
    lines.push(
      translate('Organization groups: {names}', {
        names: names(rule.organization_groups_summary),
      }),
    );
  }
  if (rule.roles?.length) {
    lines.push(translate('Roles: {names}', { names: rule.roles.join(', ') }));
  }
  const lists: Array<[string, string[] | undefined]> = [
    [translate('Email patterns'), rule.user_email_patterns],
    [translate('Affiliations'), rule.user_affiliations],
    [translate('Identity sources'), rule.user_identity_sources],
    [translate('Nationalities'), rule.user_nationalities],
    [translate('Organization types'), rule.user_organization_types],
    [translate('Assurance levels'), rule.user_assurance_levels],
  ];
  for (const [label, values] of lists) {
    if (values?.length) lines.push(`${label}: ${values.join(', ')}`);
  }
  const claims = Object.keys(rule.user_claims ?? {});
  if (claims.length) {
    lines.push(translate('Claims: {names}', { names: claims.join(', ') }));
  }
  // A rule without criteria matches no one.
  return lines.length ? lines : [translate('No one')];
};

/** Active rules per feature key, from one listing of every rule. */
export const countActiveRules = (rules: FeatureRule[]) =>
  rules.reduce<Record<string, number>>((counts, rule) => {
    if (rule.is_active !== false) {
      counts[rule.feature_key] = (counts[rule.feature_key] ?? 0) + 1;
    }
    return counts;
  }, {});

const NO_RULES: FeatureRule[] = [];

/** Every feature rule. Only staff and support may list rules, so nobody else asks. */
export const useFeatureRules = (enabled: boolean) => {
  const { data } = useQuery({
    queryKey: FEATURE_RULES_QUERY_KEY,
    queryFn: () =>
      getAllPages((page) =>
        featureRulesList({ query: { page, page_size: 100 } }),
      ),
    enabled,
    staleTime: 30_000,
  });
  return data ?? NO_RULES;
};

/** Active rules per feature key. */
export const useActiveRuleCounts = (enabled: boolean) => {
  const rules = useFeatureRules(enabled);
  return useMemo(() => countActiveRules(rules), [rules]);
};

/** Inactive rules per feature key: what turning a feature Off left paused. */
export const useInactiveRuleCounts = (enabled: boolean) => {
  const rules = useFeatureRules(enabled);
  return useMemo(
    () =>
      countActiveRules(
        rules
          .filter((rule) => rule.is_active === false)
          .map((rule) => ({ ...rule, is_active: true })),
      ),
    [rules],
  );
};

const EMPTY_KEYS: ReadonlySet<string> = new Set();

/**
 * The dotted keys of the flags feature rules may target, from the feature
 * metadata: the generated FeaturesDescription does not carry the scope.
 */
export const useUserScopedFeatureKeys = (enabled: boolean) => {
  const { data } = useQuery({
    queryKey: ['feature-metadata'],
    queryFn: async () => (await metadataFeaturesRetrieve()).data,
    enabled,
    staleTime: Infinity,
  });
  return useMemo(() => {
    if (!data) return EMPTY_KEYS;
    const keys = new Set<string>();
    for (const section of data.features) {
      for (const item of section.items) {
        if (item.scope === 'user') keys.add(`${section.key}.${item.key}`);
      }
    }
    return keys;
  }, [data]);
};
