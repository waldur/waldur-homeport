import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

const CustomerCreateRequestFeedback = ({ request }) => (
  <>
    <p>
      {request.state === 'draft'
        ? translate('Organization creation request is not submitted yet.')
        : request.state === 'canceled'
        ? translate('Organization creation request has been canceled.')
        : request.state === 'pending'
        ? translate(
            'Organization creation request is waiting for approval by staff user.',
          )
        : request.state === 'approved'
        ? translate(
            'Organization creation request has been approved by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )
        : translate(
            'Organization creation request has been rejected by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )}
    </p>
    {request.review_comment && (
      <p>
        {translate('Organization creation request review')}:{' '}
        {request.review_comment}
      </p>
    )}
  </>
);

const ProjectCreateRequestFeedback = ({ request }) => (
  <>
    <p>
      {request.state === 'draft'
        ? translate('Project creation request is not submitted yet.')
        : request.state === 'canceled'
        ? translate('Project creation request has been canceled.')
        : request.state === 'pending'
        ? translate(
            'Project creation request is waiting for approval by staff user.',
          )
        : request.state === 'approved'
        ? translate(
            'Project creation request has been approved by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )
        : translate(
            'Project creation request has been rejected by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )}
    </p>
    {request.review_comment && (
      <p>
        {translate('Project creation request review')}: {request.review_comment}
      </p>
    )}
  </>
);

const ResourceCreateRequest = ({ request }) => (
  <>
    <p>
      {request.state === 'draft'
        ? translate('Resource creation request is not submitted yet.')
        : request.state === 'canceled'
        ? translate('Resource creation request has been canceled.')
        : request.state === 'pending'
        ? translate(
            'Resource creation request is waiting for approval by service provider.',
          )
        : request.state === 'approved'
        ? translate(
            'Resource creation request has been approved by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )
        : translate(
            'Resource creation request has been rejected by {user} at {date}.',
            {
              user: request.reviewed_by_full_name,
              date: formatDateTime(request.reviewed_at),
            },
          )}
    </p>
    {request.review_comment && (
      <p>
        {translate('Resource creation request review')}:{' '}
        {request.review_comment}
      </p>
    )}
  </>
);

export const FlowExpandableRow = ({ row }) => (
  <>
    {row.customer_name && (
      <p>
        {translate('Organization')}: {row.customer_name}
      </p>
    )}
    {row.customer_create_request && (
      <CustomerCreateRequestFeedback request={row.customer_create_request} />
    )}
    <ProjectCreateRequestFeedback request={row.project_create_request} />
    <ResourceCreateRequest request={row.resource_create_request} />
  </>
);
