import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, Card } from 'react-bootstrap';
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
    <Button variant="light" onClick={callback}>
      <span className="svg-icon svg-icon-2">
        <PlusCircle />
      </span>
      {translate('Create')}
    </Button>
  );
};

export const ResourceIssuesCard = ({ resource }) => {
  const showIssues = useSelector(hasSupport);
  return showIssues ? (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('Tickets')}</h3>
        </Card.Title>
        <div className="card-toolbar">
          <CreateIssueButton resource={resource} />
        </div>
      </Card.Header>
      <Card.Body>
        <ResourceIssues resource={resource} />
      </Card.Body>
    </Card>
  ) : null;
};
