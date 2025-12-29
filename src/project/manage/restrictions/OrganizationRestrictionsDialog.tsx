import { FC } from 'react';
import { Customer } from 'waldur-js-client';

import { getRestrictionsArray } from '@waldur/core/restrictions';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';

interface OrganizationRestrictionsDialogProps {
  resolve: {
    customer: Customer;
  };
}

const RestrictionsDisplay: FC<{
  title: string;
  values: string[];
}> = ({ title, values }) => {
  if (values.length === 0) {
    return (
      <div className="mb-4">
        <strong>{title}:</strong>{' '}
        <span className="text-muted fst-italic">
          {translate('No restrictions configured')}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <strong>{title}:</strong>
      <div className="d-flex flex-wrap gap-2 mt-2">
        {values.map((value) => (
          <span key={value} className="badge badge-light">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
};

export const OrganizationRestrictionsDialog: FC<
  OrganizationRestrictionsDialogProps
> = ({ resolve }) => {
  const { customer } = resolve;

  const emailPatterns = getRestrictionsArray(customer.user_email_patterns);
  const affiliations = getRestrictionsArray(customer.user_affiliations);
  const identitySources = getRestrictionsArray(customer.user_identity_sources);

  const hasAnyRestrictions =
    emailPatterns.length > 0 ||
    affiliations.length > 0 ||
    identitySources.length > 0;

  return (
    <ModalDialog
      title={translate('Organization membership restrictions')}
      subtitle={customer.name}
    >
      {!hasAnyRestrictions ? (
        <p className="text-muted fst-italic">
          {translate(
            'No membership restrictions are configured at the organization level.',
          )}
        </p>
      ) : (
        <>
          <p className="text-muted mb-4">
            {translate(
              'These restrictions are configured at the organization level and apply to all projects within this organization.',
            )}
          </p>

          <RestrictionsDisplay
            title={translate('Email patterns')}
            values={emailPatterns}
          />

          <RestrictionsDisplay
            title={translate('User affiliations')}
            values={affiliations}
          />

          <RestrictionsDisplay
            title={translate('Identity sources')}
            values={identitySources}
          />
        </>
      )}
    </ModalDialog>
  );
};
