import { Fragment, FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { Event } from '@waldur/events/types';
import { translate } from '@waldur/i18n';
import { LoadingScreen } from '@waldur/LoadingScreen';
import { Project } from '@waldur/workspace/types';

import { fetchLatestEvents } from './api';

const EventItemTr = (item: Event, expanded, onClick: (item) => void) => {
  const date = formatDateTime(item.created);
  return (
    <Fragment key={item.uuid}>
      <tr>
        <td className="text-decoration-underline text-dark w-100 py-3">
          <span onClick={() => onClick(item)}>
            <Tip label={item.message} id={`event-${item.uuid}`}>
              {truncate(item.message)}{' '}
              {expanded === item.uuid ? (
                <i className="fa fa-chevron-up" />
              ) : (
                <i className="fa fa-chevron-down" />
              )}
            </Tip>
          </span>
        </td>
        <td className="text-nowrap">{date}</td>
      </tr>
      {expanded === item.uuid && (
        <tr>
          <td colSpan={3}>{item.message}</td>
        </tr>
      )}
    </Fragment>
  );
};

export const ShortEventsList: FunctionComponent<{ project: Project }> = ({
  project,
}) => {
  const [expanded, setExpanded] = useState('');
  const { loading, error, value } = useAsync(() =>
    fetchLatestEvents(project, 3),
  );

  const toggleExpand = (event) => {
    if (expanded === event.uuid) setExpanded('');
    else setExpanded(event.uuid);
  };

  if (loading) {
    return <LoadingScreen loading={loading} error={error} />;
  }
  return (
    <Card>
      <Card.Body>
        <div className="d-flex flex-column justify-content-between align-items-end h-100">
          <table className="table align-middle fs-8">
            <tbody>
              {value.map((event) => EventItemTr(event, expanded, toggleExpand))}
            </tbody>
          </table>
          <Link
            state="project.events"
            params={{ uuid: project.uuid }}
            className="btn btn-light btn-sm min-w-100px"
          >
            {translate('Audit log')}
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};
