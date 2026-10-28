import { FC } from 'react';
import { Rule } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface RuleExpandableRowProps {
  row: Rule;
}

export const RuleExpandableRow: FC<RuleExpandableRowProps> = ({ row }) => (
  <ExpandableContainer>
    <div className="grid grid-cols-12 gap-3">
      {Boolean(row.plan) && (
        <div className="col-span-12 md:col-span-5 2xl:col-span-4">
          <h6 className="text-secondary mb-2.5">
            {translate('Resource template')}
          </h6>
          <Field
            label={translate('Category')}
            value={row.category_title}
            space={1.5}
          />
          <Field
            label={translate('Offering')}
            value={row.offering_name}
            space={1.5}
          />
          <Field label={translate('Plan')} value={row.plan_name} space={1.5} />
        </div>
      )}
      <div className="col-span-6">
        <h6 className="text-secondary mb-2.5">{translate('Attributes')}</h6>
        <Field
          label={translate('Email patterns')}
          value={
            row.user_email_patterns?.length
              ? row.user_email_patterns.join(', ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={1.5}
        />
        <Field
          label={translate('Affiliations')}
          value={
            row.user_affiliations?.length
              ? row.user_affiliations.join(', ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={1.5}
        />
        <Field
          label={translate('Identity sources')}
          value={
            row.user_identity_sources?.length
              ? row.user_identity_sources.join(', ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={1.5}
        />
        <Field
          label={translate('Claims')}
          value={
            Object.keys(row.user_claims ?? {}).length
              ? Object.entries(row.user_claims)
                  .map(
                    ([claim, values]) =>
                      `${claim}: ${(values as string[]).join(', ')}`,
                  )
                  .join(' · ')
              : DASH_ESCAPE_CODE
          }
          valueClass="ellipsis"
          space={1.5}
        />
        <Field
          label={translate('Organization role')}
          value={row.customer_role_display_name || DASH_ESCAPE_CODE}
          space={1.5}
        />
        <Field
          label={translate('Creates project')}
          value={row.create_project ? translate('Yes') : translate('No')}
          space={1.5}
        />
        {row.create_project && (
          <Field
            label={translate('Project name template')}
            value={row.project_name_template || translate('Username')}
            valueClass="ellipsis"
            space={1.5}
          />
        )}
        <Field
          label={translate('Revokes when unmatched')}
          value={row.revoke_when_unmatched ? translate('Yes') : translate('No')}
          space={1.5}
        />
      </div>
    </div>
  </ExpandableContainer>
);
