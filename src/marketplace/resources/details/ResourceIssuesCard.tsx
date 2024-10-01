import { PlusCircle } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { hasSupport } from '@waldur/issues/hooks';
import { ActionButton } from '@waldur/table/ActionButton';

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
    <ActionButton
      iconNode={<PlusCircle />}
      title={translate('Create')}
      action={callback}
    />
  );
};

export const ResourceIssuesCard = ({ resource }) => {
  const showIssues = useSelector(hasSupport);
  return showIssues ? (
    <Card className="card-bordered">
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
