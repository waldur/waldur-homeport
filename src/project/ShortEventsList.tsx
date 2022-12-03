import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { connect } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { getEventsList } from '@waldur/events/BaseEventsList';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { getProject } from '@waldur/workspace/selectors';
import { Project } from '@waldur/workspace/types';

const PureProjectEvents = getEventsList({
  getDefaultFilter: () => ({
    page_size: 3,
  }),
  mapPropsToFilter: (props) => {
    return {
      scope: props.project ? props.project.url : undefined,
      feature: ['projects', 'resources'],
    };
  },
  mapPropsToTableId: (props) => ['project-events', props.project?.uuid],
});

const mapStateToProps = (state: RootState) => ({
  project: getProject(state),
});

const ProjectEvents = connect(mapStateToProps)(PureProjectEvents);

export const ShortEventsList: FunctionComponent<{ project: Project }> = ({
  project,
}) => {
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column justify-content-between h-100">
          <ProjectEvents
            hasQuery={false}
            title={translate('Events')}
            verboseName={translate('events')}
            actions={undefined}
            enableExport={false}
            fullWidth={true}
          />

          <Link
            state="project.events"
            params={{ uuid: project.uuid }}
            className="btn btn-light btn-sm min-w-100px align-self-end"
          >
            {translate('Audit log')}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
