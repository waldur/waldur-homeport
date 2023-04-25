import { FunctionComponent } from 'react';
import './OrganizationGroup.scss';

interface OrganizationGroupProps {
  organizationGroup: string;
}

export const OrganizationGroup: FunctionComponent<OrganizationGroupProps> = ({
  organizationGroup,
}) =>
  organizationGroup ? (
    <div className="organizationGroupContainer">{organizationGroup}</div>
  ) : null;
