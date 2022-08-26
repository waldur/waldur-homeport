import { FunctionComponent } from 'react';
import { connect } from 'react-redux';

import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { useProjectItems } from '@waldur/navigation/navitems';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';

const EVENT_TYPES = ['role_granted', 'role_revoked', 'role_updated'];

export const PureProjectPermissionsLogList = getEventsList({
  mapPropsToFilter: (props) =>
    props.project
      ? {
          scope: props.project.url,
          event_type: EVENT_TYPES,
        }
      : { event_type: EVENT_TYPES },
  mapPropsToTableId: (props) => ['project-permissions', props.project?.uuid],
});

const enhance = connect((state: RootState) => ({
  project: getProject(state),
}));

export const ProjectPermissionsLogList: FunctionComponent = enhance(() => {
  useTitle(translate('Permissions log'));
  useProjectItems();
  return <PureProjectPermissionsLogList />;
});
