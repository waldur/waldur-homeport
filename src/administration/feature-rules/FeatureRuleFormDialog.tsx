import { PencilSimpleIcon, PlusCircleIcon } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  FeatureRule,
  featureRulesCreate,
  featureRulesUpdate,
  organizationGroupsList,
} from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { UserClaimsField } from '@/administration/auto-provisioning-rules/UserClaimsField';
import { validateEmailPatterns } from '@/administration/auto-provisioning-rules/utils';
import { ENV } from '@/core/config';
import {
  AsyncSelectGroup,
  BooleanGroup,
  CommaSeparatedListGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { createLoadOptions } from '@/form/select';
import { translate } from '@/i18n';
import {
  organizationAutocomplete,
  userAutocomplete,
} from '@/marketplace/common/autocompletes';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import {
  FEATURE_RULES_QUERY_KEY,
  FeatureRuleFormValues,
  formValuesToPayload,
  hasCriterion,
  ruleToFormValues,
} from './utils';

const organizationGroupAutocomplete = createLoadOptions(
  organizationGroupsList,
  'name',
);

interface FeatureRuleFormDialogProps {
  resolve: {
    featureKey: string;
    /** What the rule turns on, for the dialog title. */
    featureLabel: string;
    rule?: FeatureRule;
    refetch?: () => void;
    /** Reopens the rules list this dialog was opened from, after saving or
     * cancelling; without it the dialog just closes. */
    back?: () => void;
  };
}

const optionLabel = (option) =>
  option.full_name || option.name || option.username || option.email || '';

export const FeatureRuleFormDialog: FC<FeatureRuleFormDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.rule);
  const initialValues = useMemo(
    () => ruleToFormValues(resolve.rule),
    [resolve.rule],
  );
  const loadOrganizations = useMemo(() => organizationAutocomplete(), []);
  const roleOptions = useMemo(
    () =>
      (ENV.roles ?? [])
        .filter((role) => role.is_active)
        .map((role) => ({
          value: role.name,
          label: role.description
            ? `${role.name} — ${role.description}`
            : role.name,
        })),
    [],
  );

  const submitMutation = useManagedMutation({
    mutationFn: (values: FeatureRuleFormValues) => {
      const body = formValuesToPayload(resolve.featureKey, values);
      return isEdit
        ? featureRulesUpdate({ path: { uuid: resolve.rule.uuid }, body })
        : featureRulesCreate({ body });
    },
    successMessage: isEdit
      ? translate('Rule has been updated.')
      : translate('Rule has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update the rule.')
      : translate('Unable to create the rule.'),
    refetch: resolve.refetch,
    invalidateQueries: [{ queryKey: FEATURE_RULES_QUERY_KEY }],
    closeModal: !resolve.back,
    onSuccess: () => resolve.back?.(),
  });

  return (
    <Form<FeatureRuleFormValues>
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit rule for {feature}', {
                    feature: resolve.featureLabel,
                  })
                : translate('Add rule for {feature}', {
                    feature: resolve.featureLabel,
                  })
            }
            iconNode={
              isEdit ? (
                <PencilSimpleIcon weight="bold" />
              ) : (
                <PlusCircleIcon weight="bold" />
              )
            }
            iconColor="success"
            subtitle={translate(
              'A user matches when every group of criteria you fill in matches: listed users, organizations, roles and identity attributes.',
            )}
            footer={
              <>
                <CloseDialogButton onClick={resolve.back} />
                <SubmitButton
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                  // A new rule needs a criterion; an existing one emptied by
                  // deletions elsewhere can still be saved or turned off.
                  disabled={invalid || (!isEdit && !hasCriterion(values))}
                  disabledReason={
                    !isEdit && !hasCriterion(values)
                      ? translate('Fill in at least one criterion.')
                      : undefined
                  }
                  variant="primary"
                />
              </>
            }
          >
            <StringGroup
              name="description"
              label={translate('Description')}
              placeholder={translate('e.g. Pilot group')}
              disabled={submitting}
            />
            <BooleanGroup
              name="is_active"
              label={translate('Active')}
              disabled={submitting}
            />
            <AsyncSelectGroup
              name="users"
              label={translate('Users')}
              loadOptions={userAutocomplete}
              isMulti
              getOptionValue={(option) => option.uuid}
              getOptionLabel={optionLabel}
              placeholder={translate('Search by name, email or username...')}
              noOptionsMessage={() => translate('No users')}
              isDisabled={submitting}
            />
            <AsyncSelectGroup
              name="customers"
              label={translate('Organizations')}
              description={translate(
                'Members of any of these organizations or of their projects match.',
              )}
              loadOptions={loadOrganizations}
              isMulti
              getOptionValue={(option) => option.uuid}
              getOptionLabel={optionLabel}
              noOptionsMessage={() => translate('No organizations')}
              isDisabled={submitting}
            />
            <AsyncSelectGroup
              name="organization_groups"
              label={translate('Organization groups')}
              description={translate(
                'Members of an organization in any of these groups match.',
              )}
              loadOptions={organizationGroupAutocomplete}
              isMulti
              getOptionValue={(option) => option.uuid}
              getOptionLabel={optionLabel}
              noOptionsMessage={() => translate('No organization groups')}
              isDisabled={submitting}
            />
            <SelectGroup
              name="roles"
              label={translate('Roles')}
              description={translate(
                'Users holding any of these roles, in any scope, match.',
              )}
              options={roleOptions}
              isMulti
              simpleValue
              isDisabled={submitting}
            />
            <CommaSeparatedListGroup
              label={translate('Email patterns')}
              name="user_email_patterns"
              placeholder={translate('e.g. .*@example\\.com$')}
              description={translate(
                'Space-separated regular expressions matched against the email address. End a pattern with $ so that lookalike domains such as example.com.attacker.net do not match.',
              )}
              separator="space"
              validate={validateEmailPatterns}
            />
            <CommaSeparatedListGroup
              label={translate('Affiliations')}
              name="user_affiliations"
              placeholder="student, faculty, researcher (comma-separated)"
            />
            <CommaSeparatedListGroup
              label={translate('Identity sources')}
              name="user_identity_sources"
              placeholder="eduGAIN, haka, surfconext"
            />
            <UserClaimsField />
            <CommaSeparatedListGroup
              label={translate('Nationalities')}
              name="user_nationalities"
              placeholder="DE, FR, US"
            />
            <CommaSeparatedListGroup
              label={translate('Organization types')}
              name="user_organization_types"
              placeholder="urn:schac:homeOrganizationType:int:university"
            />
            <CommaSeparatedListGroup
              label={translate('Assurance levels')}
              name="user_assurance_levels"
              placeholder="https://refeds.org/assurance/IAP/medium"
              description={translate(
                'Users must hold ALL of these assurance levels to match.',
              )}
            />
            {hasCriterion(values) ? null : (
              <AlertItem
                variant="warning"
                type="floating"
                title={translate(
                  'No criteria: this rule matches no one. To turn the feature on for everyone, use its switch instead.',
                )}
              />
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
