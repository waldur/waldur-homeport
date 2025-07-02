import { PlusCircleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { hasSupport } from '@waldur/issues/hooks';
import { IssuesList } from '@waldur/issues/list/IssuesList';
import { ActionButton } from '@waldur/table/ActionButton';

const CreateIssueButton = ({ resource }) => {
  const dispatch = useDispatch();
  const callback = () =>
    dispatch(
      openIssueCreateDialog({
        scope: resource,
        scopeType: 'resource',
      }),
    );
  return (
    <ActionButton
      iconNode={<PlusCircleIcon weight="bold" />}
      title={translate('Create')}
      action={callback}
      variant="primary"
    />
  );
};

export const ResourceIssuesCard = ({ resource }) => {
  const showIssues = useSelector(hasSupport);
  const filter = useMemo(() => ({ resource: resource.url }), [resource]);

  return showIssues ? (
    <IssuesList
      scope={resource}
      scopeType="resource"
      filter={filter}
      title={translate('Requests')}
      verboseName={translate('Support requests')}
      initialPageSize={5}
      tableActions={<CreateIssueButton resource={resource} />}
    />
  ) : null;
};
