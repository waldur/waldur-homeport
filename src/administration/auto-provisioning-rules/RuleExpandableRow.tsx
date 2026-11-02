import { FC } from 'react';
import { Rule } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { ExpandableContainer } from '@/table/ExpandableContainer';

interface RuleExpandableRowProps {
  row: Rule;
}

export const RuleExpandableRow: FC<RuleExpandableRowProps> = ({ row }) => (
  <ExpandableContainer>
    <PropertyList
      variant="summary"
      space={1.5}
      hideIfEmpty={false}
      className="grid grid-cols-12 gap-6"
    >
      {Boolean(row.plan) && (
        <PropertyList.Section
          title={translate('Resource template')}
          className="col-span-12 md:col-span-5 2xl:col-span-4"
        >
          <PropertyItem
            label={translate('Category')}
            value={row.category_title}
          />
          <PropertyItem
            label={translate('Offering')}
            value={row.offering_name}
          />
          <PropertyItem label={translate('Plan')} value={row.plan_name} />
        </PropertyList.Section>
      )}
      <PropertyList.Section
        title={translate('Attributes')}
        className={
          row.plan
            ? 'col-span-12 md:col-span-7 2xl:col-span-8'
            : 'col-span-12 md:col-span-6'
        }
      >
        <PropertyItem
          label={translate('Email patterns')}
          value={propVal.list(row.user_email_patterns)}
          valueClass="ellipsis"
        />
        <PropertyItem
          label={translate('Affiliations')}
          value={propVal.list(row.user_affiliations)}
          valueClass="ellipsis"
        />
        <PropertyItem
          label={translate('Identity sources')}
          value={propVal.list(row.user_identity_sources)}
          valueClass="ellipsis"
        />
        <PropertyItem
          label={translate('Claims')}
          value={Object.entries(row.user_claims ?? {})
            .map(
              ([claim, values]) =>
                `${claim}: ${(values as string[]).join(', ')}`,
            )
            .join(' · ')}
          valueClass="ellipsis"
        />
        <PropertyItem
          label={translate('Organization role')}
          value={row.customer_role_display_name}
        />
        <PropertyItem
          label={translate('Creates project')}
          value={propVal.boolean(row.create_project)}
        />
        {row.create_project && (
          <PropertyItem
            label={translate('Project name template')}
            value={row.project_name_template}
            placeholder={translate('Username')}
            valueClass="ellipsis"
          />
        )}
        <PropertyItem
          label={translate('Revokes when unmatched')}
          value={propVal.boolean(row.revoke_when_unmatched)}
        />
      </PropertyList.Section>
    </PropertyList>
  </ExpandableContainer>
);
