import { FC } from 'react';
import { ProjectTemplate } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

interface OwnProps {
  row: ProjectTemplate;
}

const stringify = (value: any) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return JSON.stringify(value);
};

const CustomerLink: FC<{ customer?: any }> = ({ customer }) => {
  if (!customer) {
    return <>{translate('Not set')}</>;
  }
  return (
    <Link
      state="organization.dashboard"
      params={{ uuid: customer.uuid }}
      label={customer.display_name || customer.name || customer.uuid}
    />
  );
};

const OfferingsList: FC<{ offerings?: any[] }> = ({ offerings }) => {
  if (!offerings || offerings.length === 0) {
    return <>{translate('No offerings')}</>;
  }

  return (
    <>
      {offerings.map((offering, index) => (
        <span key={offering.uuid || offering.url || index}>
          <Link
            state="marketplace-offering-details"
            params={{
              offering_uuid: offering.uuid,
              uuid: offering.customer_uuid,
            }}
            label={offering.name}
          />
          {index < offerings.length - 1 ? ', ' : null}
        </span>
      ))}
    </>
  );
};

const RoleMapping: FC<{
  roleMapping?: Record<string, { name: string; uuid: string }>;
}> = ({ roleMapping }) => {
  if (!roleMapping || Object.keys(roleMapping).length === 0) {
    return <>{translate('No role mapping')}</>;
  }

  return (
    <>
      {Object.entries(roleMapping).map(([key, value]) => (
        <div key={key}>
          &nbsp;&nbsp;{key} : {value.name || value.uuid || translate('Not set')}
        </div>
      ))}
    </>
  );
};

const AllocationMapping: FC<{
  allocationMapping?: Record<string, any>;
}> = ({ allocationMapping }) => {
  if (!allocationMapping || Object.keys(allocationMapping).length === 0) {
    return <>{translate('No allocation mapping')}</>;
  }

  return (
    <>
      {Object.entries(allocationMapping).map(([key, value]) => (
        <div key={key}>
          &nbsp;&nbsp;1 credit = {String(value)} {key}
        </div>
      ))}
    </>
  );
};

export const ProjectTemplateExpandableRow: FC<OwnProps> = (props) => {
  const project = props.row;

  if (!project) {
    return null;
  }

  return (
    <ExpandableContainer>
      <div className="overflow-auto">
        <div>
          <strong>{translate('Name')}:</strong> {stringify(project.name)}
        </div>
        <div>
          <strong>{translate('Portal')}:</strong> {stringify(project.portal)}
        </div>
        <div>
          <strong>{translate('Offering')}:</strong>{' '}
          {stringify(project.offering)}
        </div>
        <div>
          <strong>{translate('Customer')}:</strong>{' '}
          <CustomerLink customer={project.customer_data} />
        </div>
        <div>
          <strong>{translate('Key')}:</strong> {stringify(project.key)}
        </div>
        <div>
          <strong>{translate('Shortname')}:</strong>{' '}
          {stringify(project.shortname)}
        </div>
        <div>
          <strong>{translate('Offerings')}:</strong>{' '}
          <OfferingsList offerings={project.offerings_data} />
        </div>
        <div>
          <strong>{translate('Approval limit')}:</strong>{' '}
          {stringify(project.approval_limit)}
        </div>
        <div>
          <strong>{translate('Max credit limit')}:</strong>{' '}
          {stringify(project.max_credit_limit)}
        </div>
        <div>
          <strong>{translate('Role mapping')}:</strong>{' '}
          <RoleMapping roleMapping={project.role_mapping as any} />
        </div>
        <div>
          <strong>{translate('Allocation credit mapping')}:</strong>{' '}
          <AllocationMapping
            allocationMapping={project.allocation_units_mapping}
          />
        </div>
      </div>
    </ExpandableContainer>
  );
};
