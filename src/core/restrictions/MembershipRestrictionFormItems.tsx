import { FC } from 'react';

import { CommaSeparatedListEditField } from '@/form/editFields';
import { translate } from '@/i18n';

import { RestrictionsValue } from './RestrictionsValue';
import { getRestrictionsArray } from './types';

export const MembershipRestrictionFormItems: FC = () => (
  <>
    <CommaSeparatedListEditField
      name="user_email_patterns"
      label={translate('Email patterns')}
      description={translate(
        'Users whose email matches any of these regex patterns will be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
    <CommaSeparatedListEditField
      name="user_affiliations"
      label={translate('User affiliations')}
      description={translate(
        'Users with any of these affiliations will be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
    <CommaSeparatedListEditField
      name="user_identity_sources"
      label={translate('Identity sources')}
      description={translate(
        'Users authenticated via any of these identity providers will be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
    <CommaSeparatedListEditField
      name="user_nationalities"
      label={translate('Nationalities')}
      description={translate(
        'Users with any of these nationalities will be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
    <CommaSeparatedListEditField
      name="user_organization_types"
      label={translate('Organization types')}
      description={translate(
        'Users from organizations of these types will be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
    <CommaSeparatedListEditField
      name="user_assurance_levels"
      label={translate('Assurance levels')}
      description={translate(
        'Users must have ALL of these assurance levels to be allowed.',
      )}
      renderValue={(value) => (
        <RestrictionsValue values={getRestrictionsArray(value)} />
      )}
    />
  </>
);
