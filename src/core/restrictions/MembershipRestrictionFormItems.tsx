import { FC } from 'react';

import { CompactEditButton } from '@/form/CompactEditButton';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import { RestrictionsValue } from './RestrictionsValue';
import { RestrictionField } from './types';

interface RestrictionData {
  emailPatterns: string[];
  affiliations: string[];
  identitySources: string[];
  nationalities: string[];
  organizationTypes: string[];
  assuranceLevels: string[];
}

interface MembershipRestrictionFormItemsProps {
  data: RestrictionData;
  canEdit: boolean;
  onEditField: (field: RestrictionField) => void;
}

export const MembershipRestrictionFormItems: FC<
  MembershipRestrictionFormItemsProps
> = ({ data, canEdit, onEditField }) => (
  <>
    <FormTable.Item
      label={translate('Email patterns')}
      description={translate(
        'Users whose email matches any of these regex patterns will be allowed.',
      )}
      value={<RestrictionsValue values={data.emailPatterns} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_email_patterns')}
            variant="secondary"
          />
        )
      }
    />
    <FormTable.Item
      label={translate('User affiliations')}
      description={translate(
        'Users with any of these affiliations will be allowed.',
      )}
      value={<RestrictionsValue values={data.affiliations} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_affiliations')}
            variant="secondary"
          />
        )
      }
    />
    <FormTable.Item
      label={translate('Identity sources')}
      description={translate(
        'Users authenticated via any of these identity providers will be allowed.',
      )}
      value={<RestrictionsValue values={data.identitySources} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_identity_sources')}
            variant="secondary"
          />
        )
      }
    />
    <FormTable.Item
      label={translate('Nationalities')}
      description={translate(
        'Users with any of these nationalities will be allowed.',
      )}
      value={<RestrictionsValue values={data.nationalities} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_nationalities')}
            variant="secondary"
          />
        )
      }
    />
    <FormTable.Item
      label={translate('Organization types')}
      description={translate(
        'Users from organizations of these types will be allowed.',
      )}
      value={<RestrictionsValue values={data.organizationTypes} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_organization_types')}
            variant="secondary"
          />
        )
      }
    />
    <FormTable.Item
      label={translate('Assurance levels')}
      description={translate(
        'Users must have ALL of these assurance levels to be allowed.',
      )}
      value={<RestrictionsValue values={data.assuranceLevels} />}
      actions={
        canEdit && (
          <CompactEditButton
            onClick={() => onEditField('user_assurance_levels')}
            variant="secondary"
          />
        )
      }
    />
  </>
);
