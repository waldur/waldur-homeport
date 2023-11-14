import { UISref } from '@uirouter/react';
import { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { hasSupport } from '@waldur/issues/hooks';

import { ResourceIssues } from './ResourceIssues';

const CreateIssueButton = ({ resource }) => {
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    dispatch(
      openIssueCreateDialog({
        issue: { resource },
        options: {
          descriptionLabel: translate('Description'),
        },
        hideProjectAndResourceFields: true,
      }),
    );
  }, [dispatch, resource]);
  return (
    <a className="btn btn-link ms-3" onClick={callback}>
      {translate('Create')}
    </a>
  );
};

export const ResourceIssuesCard = ({ resource, state }) => {
  const showIssues = useSelector(hasSupport);
  return showIssues ? (
    <Card className="mb-10" id="tickets">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Tickets')}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <UISref to={state.name} params={{ tab: 'issues' }}>
            <a className="btn btn-link">{translate('See all')}</a>
          </UISref>
          <CreateIssueButton resource={resource} />
        </div>
      </Card.Header>
      <Card.Body>
        <ResourceIssues resource={resource} />
      </Card.Body>
    </Card>
  ) : null;
};
