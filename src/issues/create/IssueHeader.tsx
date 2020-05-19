import * as React from 'react';
import FormGroup from 'react-bootstrap/lib/FormGroup';

import { translate } from '@waldur/i18n';

export const IssueHeader = ({ issue }) => {
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
        <FormGroup>
          <strong>{translate('Organization')}: </strong>
          {customerName}
        </FormGroup>
      )}

      {projectName && (
        <FormGroup>
          <strong>{translate('Project')}: </strong>
          {projectName}
        </FormGroup>
      )}

      {issue.resource && (
        <FormGroup>
          <strong>{translate('Resource')}: </strong>
          {issue.resource.name}
        </FormGroup>
      )}

      {issue.type && (
        <FormGroup>
          <strong>{translate('Request type')}: </strong>
          {translate(issue.type)}
        </FormGroup>
      )}
    </>
  );
};
