import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';
import { getCustomerRoles, getProjectRoles } from '@/permissions/utils';
import { WizardForm, WizardFormStepProps } from '@/wizard';

import { rowsToClaims, toList } from './utils';

/** A plain-language recap of what the rule will do.
 *
 * This is the last thing an administrator sees before creating a rule that
 * grants roles on its own, so it restates the decision in one sentence rather
 * than leaving them to reconstruct it from three steps of controls.
 */
/** The pickers store the machine name; show the label the picker displayed. */
const roleLabel = (
  name: string,
  roles: { name: string; description?: string }[],
) => roles.find((role) => role.name === name)?.description || name;

const Summary: FC = () => {
  const { values } = useFormState({ subscription: { values: true } });
  const claims = Object.entries(rowsToClaims(values.user_claims));
  const filters = [
    toList(values.user_affiliations).length && translate('affiliations'),
    toList(values.user_email_patterns, ' ').length && translate('email'),
    toList(values.user_identity_sources).length && translate('identity source'),
    toList(values.user_nationalities).length && translate('nationality'),
    toList(values.user_organization_types).length &&
      translate('organization type'),
    toList(values.user_assurance_levels).length && translate('assurance level'),
    claims.length &&
      translate('claims ({claims})', {
        claims: claims.map(([claim]) => claim).join(', '),
      }),
  ].filter(Boolean) as string[];

  const grants = [
    values.customer_role &&
      translate('{role} on the organization', {
        role: roleLabel(values.customer_role, getCustomerRoles()),
      }),
    values.create_project !== false &&
      values.project_role &&
      translate('{role} on their project', {
        role: roleLabel(values.project_role, getProjectRoles()),
      }),
  ].filter(Boolean) as string[];

  return (
    <div className="mb-5">
      <h6 className="mb-2">{translate('Summary')}</h6>
      <ul className="mb-0 ps-4">
        <li>
          {filters.length
            ? translate('Matches users by: {filters}.', {
                filters: filters.join(', '),
              })
            : translate(
                'Matches every authenticated user — no filter is configured.',
              )}
        </li>
        <li>
          {grants.length
            ? translate('Grants: {grants}.', { grants: grants.join(', ') })
            : translate(
                'Grants nothing yet — choose a role on the previous step.',
              )}
        </li>
      </ul>
    </div>
  );
};

/** Step 3: whether the rule withdraws what it granted. */
export const RuleStepRevocation: FC<WizardFormStepProps> = (props) => {
  const { values } = useFormState({ subscription: { values: true } });
  return (
    <WizardForm {...props}>
      <Summary />
      <BooleanGroup
        name="revoke_when_unmatched"
        label={translate('Revoke roles when the user stops matching')}
        tooltip={translate(
          'Keeps roles in step with the identity provider, the way SCIM group membership does.',
        )}
        tooltipEnd
        alignMiddle
        className="w-100"
      />
      {values.revoke_when_unmatched && (
        <div className="alert alert-warning py-2 px-3 mb-0">
          {translate(
            'Roles this rule granted will be revoked the next time a user who no longer matches signs in. Roles granted by a person, and roles granted by other rules, are never touched.',
          )}
        </div>
      )}
    </WizardForm>
  );
};
