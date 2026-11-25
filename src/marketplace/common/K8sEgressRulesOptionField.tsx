import { FC } from 'react';

import { FormField } from '@/form/types';

import { K8sEgressPolicy, K8sEgressRule } from './k8sEgressRules';
import { K8sEgressRulesSection } from './K8sEgressRulesSection';

/**
 * A k8s_egress_rules resource option: the outbound destinations of an
 * existing cluster. Its policy is a copy of the cluster order option's,
 * kept by the server in the option's default_configs.
 */
export const K8sEgressRulesOptionField: FC<
  FormField & {
    field: { label?: string; default_configs?: K8sEgressPolicy };
  }
> = ({ field, input, meta }) => (
  <K8sEgressRulesSection
    title={field.label}
    policy={field.default_configs || {}}
    rules={(input.value as K8sEgressRule[]) || []}
    onChange={input.onChange}
    error={meta?.error}
  />
);
