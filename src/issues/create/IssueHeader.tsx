import { FunctionComponent } from 'react';
import { FormGroup } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

export const IssueHeader: FunctionComponent<{ issue }> = ({ issue }) => {
  const customerName = issue.customer
    ? issue.customer.name
    : issue.project
    ? issue.project.customer_name
    : issue.resource
    ? issue.resource.customer_name
    : undefined;
  const projectName = issue.project
    ? issue.project.name
    : issue.resource
    ? issue.resource.project_name
    : undefined;
  return (
    <>
      {customerName && (
        <FormGroup className="mb-5">
          <strong>{translate('Organization')}: </strong>
          {customerName}
        </FormGroup>
      )}

      {projectName && (
        <FormGroup className="mb-5">
          <strong>{translate('Project')}: </strong>
          {projectName}
        </FormGroup>
      )}

      {issue.resource && (
        <FormGroup className="mb-5">
          <strong>{translate('Resource')}: </strong>
          {issue.resource.name}
        </FormGroup>
      )}
      {!ENV.plugins.WALDUR_SUPPORT?.DISPLAY_REQUEST_TYPE && issue.type && (
        <FormGroup className="mb-5">
          <strong>{translate('Request type')}: </strong>
          {translate(issue.type)}
        </FormGroup>
      )}
    </>
  );
};
