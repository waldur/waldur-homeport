import { UISref } from '@uirouter/react';
import { useCallback } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';

import { ResourceIssues } from './ResourceIssues';

const CreateIssueButton = ({ resource }) => {
  const dispatch = useDispatch();
  const callback = useCallback(() => {
    dispatch(
      openIssueCreateDialog({
        issue: {
          type: ISSUE_IDS.CHANGE_REQUEST,
          resource,
        },
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
  return ENV.plugins.WALDUR_SUPPORT ? (
    <Card className="mb-7">
      <Card.Header>
        <Card.Title>
          <h3 className="mb-5">{translate('Tickets')}</h3>
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
