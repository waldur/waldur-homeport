import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import {
  autoprovisioningRulesCreate,
  autoprovisioningRulesUpdate,
  Customer,
  Rule,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ProgressStep, WizardFormContainer } from '@/wizard';

import { RuleStepGrants } from './RuleStepGrants';
import { RuleStepMatching } from './RuleStepMatching';
import { RuleStepRevocation } from './RuleStepRevocation';
import { ClaimRow, claimsToRows, rowsToClaims, toList } from './utils';

const wizardForms = [RuleStepMatching, RuleStepGrants, RuleStepRevocation];

const steps: ProgressStep[] = [
  { key: 'matching', label: translate('Who it matches'), completed: false },
  { key: 'grants', label: translate('What it grants'), completed: false },
  { key: 'revocation', label: translate('Revocation'), completed: false },
];

interface RuleFormDialogProps {
  resolve: { refetch; rule?: Rule; isDuplicate?: boolean };
}

interface AutoProvisioningRuleForm {
  name: string;
  customer?: Pick<Customer, 'name' | 'url'>;
  project_role?: string;
  customer_role?: string;
  create_project: boolean;
  revoke_when_unmatched: boolean;
  use_user_organization_as_customer_name: boolean;
  // `CommaSeparatedListGroup` seeds these from a string but emits an array.
  user_affiliations: string | string[];
  user_email_patterns: string | string[];
  user_identity_sources: string | string[];
  user_nationalities: string | string[];
  user_organization_types: string | string[];
  user_assurance_levels: string | string[];
  // The API carries a map; the form edits it as rows (see utils).
  user_claims: ClaimRow[];
}

export const RuleFormDialog: FC<RuleFormDialogProps> = ({ resolve }) => {
  const isEdit = Boolean(resolve.rule) && !resolve.isDuplicate;
  const isDuplicate = Boolean(resolve.isDuplicate);
  const { confirm } = useModal();

  const initialValues = resolve.rule
    ? {
        name: resolve.rule.name,
        customer: resolve.rule.customer
          ? { url: resolve.rule.customer, name: resolve.rule.customer_name }
          : null,
        project_role: resolve.rule.project_role_display_name,
        customer_role: resolve.rule.customer_role_display_name,
        create_project: resolve.rule.create_project ?? true,
        revoke_when_unmatched: resolve.rule.revoke_when_unmatched ?? false,
        use_user_organization_as_customer_name:
          resolve.rule.use_user_organization_as_customer_name,
        // Seed the list fields with the shape the control itself emits.
        user_affiliations: resolve.rule.user_affiliations ?? [],
        user_email_patterns: resolve.rule.user_email_patterns ?? [],
        user_identity_sources: resolve.rule.user_identity_sources ?? [],
        user_nationalities: resolve.rule.user_nationalities ?? [],
        user_organization_types: resolve.rule.user_organization_types ?? [],
        user_assurance_levels: resolve.rule.user_assurance_levels ?? [],
        user_claims: claimsToRows(resolve.rule.user_claims as any),
      }
    : { create_project: true, revoke_when_unmatched: false, user_claims: [] };

  const onSubmitMutation = useManagedMutation<
    any,
    any,
    AutoProvisioningRuleForm
  >({
    mutationFn: (formData) => {
      const payload = {
        name: formData.name,
        customer: formData.customer?.url ?? null,
        project_role_name: formData.create_project
          ? (formData.project_role ?? null)
          : null,
        customer_role_name: formData.customer_role ?? null,
        create_project: formData.create_project,
        revoke_when_unmatched: formData.revoke_when_unmatched,
        creates_resource: false,
        use_user_organization_as_customer_name:
          formData.use_user_organization_as_customer_name,
        user_affiliations: toList(formData.user_affiliations),
        user_email_patterns: toList(formData.user_email_patterns, ' '),
        user_identity_sources: toList(formData.user_identity_sources),
        user_nationalities: toList(formData.user_nationalities),
        user_organization_types: toList(formData.user_organization_types),
        user_assurance_levels: toList(formData.user_assurance_levels),
        user_claims: rowsToClaims(formData.user_claims),
      };

      if (isEdit) {
        return autoprovisioningRulesUpdate({
          path: { uuid: resolve.rule.uuid },
          body: payload,
        });
      } else {
        return autoprovisioningRulesCreate({
          body: payload,
        });
      }
    },
    successMessage: isEdit
      ? translate('Rule edited successfully')
      : translate('Rule has been successfully created'),
    refetch: resolve.refetch,
  });

  const handleSubmit = async (values: AutoProvisioningRuleForm) => {
    const noFilters =
      toList(values.user_email_patterns, ' ').length === 0 &&
      toList(values.user_affiliations).length === 0 &&
      toList(values.user_identity_sources).length === 0 &&
      toList(values.user_nationalities).length === 0 &&
      toList(values.user_organization_types).length === 0 &&
      toList(values.user_assurance_levels).length === 0 &&
      Object.keys(rowsToClaims(values.user_claims)).length === 0;
    if (values.use_user_organization_as_customer_name && noFilters) {
      try {
        await confirm(
          translate('No filters configured'),
          translate(
            'No email patterns or affiliations are configured. This rule will apply to every authenticated user whose organization claim matches a Waldur organization. Proceed?',
          ),
        );
      } catch {
        return;
      }
    }
    return onSubmitMutation.mutateAsync(values);
  };

  return (
    <WizardFormContainer<AutoProvisioningRuleForm>
      title={
        isEdit
          ? translate('Edit auto-provisioning rule')
          : isDuplicate
            ? translate('Duplicate auto-provisioning rule')
            : translate('Add auto-provisioning rule')
      }
      steps={steps}
      wizardForms={wizardForms}
      mutators={{ ...arrayMutators }}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      submitLabel={isEdit ? translate('Edit') : translate('Confirm')}
    />
  );
};
