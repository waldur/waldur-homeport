import { WarningCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';
import { Customer, Project } from 'waldur-js-client';

import { AccordionCard } from '@waldur/core/AccordionCard';
import {
  getRestrictionsArray,
  RestrictionsValue,
} from '@waldur/core/restrictions';
import { translate } from '@waldur/i18n';

interface RestrictionsInfoCardProps {
  customer: Customer;
  project?: Project;
  className?: string;
}

interface RestrictionsSectionProps {
  title: string;
  emailPatterns: string[];
  affiliations: string[];
  identitySources: string[];
  nationalities: string[];
  organizationTypes: string[];
  assuranceLevels: string[];
}

const RestrictionsSection: FC<RestrictionsSectionProps> = ({
  title,
  emailPatterns,
  affiliations,
  identitySources,
  nationalities,
  organizationTypes,
  assuranceLevels,
}) => {
  const hasAny =
    emailPatterns.length > 0 ||
    affiliations.length > 0 ||
    identitySources.length > 0 ||
    nationalities.length > 0 ||
    organizationTypes.length > 0 ||
    assuranceLevels.length > 0;

  if (!hasAny) return null;

  return (
    <div className="mb-4">
      <h6 className="fw-bold mb-3">{title}</h6>
      {emailPatterns.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">
            {translate('Email patterns')}:
          </span>
          <RestrictionsValue values={emailPatterns} />
        </div>
      )}
      {affiliations.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">{translate('Affiliations')}:</span>
          <RestrictionsValue values={affiliations} />
        </div>
      )}
      {identitySources.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">
            {translate('Identity sources')}:
          </span>
          <RestrictionsValue values={identitySources} />
        </div>
      )}
      {nationalities.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">{translate('Nationalities')}:</span>
          <RestrictionsValue values={nationalities} />
        </div>
      )}
      {organizationTypes.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">
            {translate('Organization types')}:
          </span>
          <RestrictionsValue values={organizationTypes} />
        </div>
      )}
      {assuranceLevels.length > 0 && (
        <div className="mb-2">
          <span className="text-muted me-2">
            {translate('Assurance levels')}:
          </span>
          <RestrictionsValue values={assuranceLevels} />
        </div>
      )}
    </div>
  );
};

export const RestrictionsInfoCard: FC<RestrictionsInfoCardProps> = ({
  customer,
  project,
  className,
}) => {
  // Get restrictions from customer
  const customerEmailPatterns = getRestrictionsArray(
    customer?.user_email_patterns,
  );
  const customerAffiliations = getRestrictionsArray(
    customer?.user_affiliations,
  );
  const customerIdentitySources = getRestrictionsArray(
    customer?.user_identity_sources,
  );
  const customerNationalities = getRestrictionsArray(
    customer?.['user_nationalities'],
  );
  const customerOrganizationTypes = getRestrictionsArray(
    customer?.['user_organization_types'],
  );
  const customerAssuranceLevels = getRestrictionsArray(
    customer?.['user_assurance_levels'],
  );

  // Get restrictions from project (if provided)
  const projectEmailPatterns = getRestrictionsArray(
    project?.user_email_patterns,
  );
  const projectAffiliations = getRestrictionsArray(project?.user_affiliations);
  const projectIdentitySources = getRestrictionsArray(
    project?.user_identity_sources,
  );
  const projectNationalities = getRestrictionsArray(
    project?.['user_nationalities'],
  );
  const projectOrganizationTypes = getRestrictionsArray(
    project?.['user_organization_types'],
  );
  const projectAssuranceLevels = getRestrictionsArray(
    project?.['user_assurance_levels'],
  );

  const hasCustomerRestrictions =
    customerEmailPatterns.length > 0 ||
    customerAffiliations.length > 0 ||
    customerIdentitySources.length > 0 ||
    customerNationalities.length > 0 ||
    customerOrganizationTypes.length > 0 ||
    customerAssuranceLevels.length > 0;

  const hasProjectRestrictions =
    projectEmailPatterns.length > 0 ||
    projectAffiliations.length > 0 ||
    projectIdentitySources.length > 0 ||
    projectNationalities.length > 0 ||
    projectOrganizationTypes.length > 0 ||
    projectAssuranceLevels.length > 0;

  if (!hasCustomerRestrictions && !hasProjectRestrictions) {
    return null;
  }

  return (
    <AccordionCard
      title={
        <span className="d-flex align-items-center gap-2 text-warning">
          <WarningCircleIcon weight="bold" size={20} />
          {translate('Membership restrictions apply')}
        </span>
      }
      className={classNames('bg-light-warning', className || 'mb-5')}
      titleClassName="fs-6"
      size="sm"
    >
      <p className="text-muted mb-4">
        {translate(
          'Only users matching the following criteria can accept this invitation. Users must satisfy at least one criterion from each configured restriction type.',
        )}
      </p>

      <RestrictionsSection
        title={translate('Organization restrictions')}
        emailPatterns={customerEmailPatterns}
        affiliations={customerAffiliations}
        identitySources={customerIdentitySources}
        nationalities={customerNationalities}
        organizationTypes={customerOrganizationTypes}
        assuranceLevels={customerAssuranceLevels}
      />

      <RestrictionsSection
        title={translate('Project restrictions')}
        emailPatterns={projectEmailPatterns}
        affiliations={projectAffiliations}
        identitySources={projectIdentitySources}
        nationalities={projectNationalities}
        organizationTypes={projectOrganizationTypes}
        assuranceLevels={projectAssuranceLevels}
      />
    </AccordionCard>
  );
};
