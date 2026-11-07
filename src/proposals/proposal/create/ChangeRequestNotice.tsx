import { FC } from 'react';
import { ProposalChangeRequest } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';

import { changeRequestPartLabel } from '../changeRequests';

const earliestDue = (requests: ProposalChangeRequest[]) =>
  requests
    .map((request) => request.due_at)
    .filter((due): due is string => Boolean(due))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0];

const RequestBody: FC<{ request: ProposalChangeRequest }> = ({ request }) => (
  <>
    <p className="mb-1.5" style={{ whiteSpace: 'pre-wrap' }}>
      {request.message}
    </p>
    <p className="mb-1">
      {translate('You may edit: {parts}.', {
        parts: request.unlocked_parts.map(changeRequestPartLabel).join(', '),
      })}
    </p>
  </>
);

/**
 * What the applicant is asked to change, above the reopened form. Several
 * steps of a stage may each ask at once: their requests are listed
 * together, and one submission answers them all.
 */
export const ChangeRequestNotice: FC<{
  changeRequests: ProposalChangeRequest[];
  className?: string;
}> = ({ changeRequests, className }) => {
  const due = earliestDue(changeRequests);
  const single = changeRequests.length === 1;
  return (
    <AlertItem
      variant="warning"
      className={className}
      title={
        single
          ? translate('Changes requested at {step}', {
              step: changeRequests[0].step_name,
            })
          : translate('Changes requested at {count} steps', {
              count: changeRequests.length,
            })
      }
      body={
        <>
          {single ? (
            <RequestBody request={changeRequests[0]} />
          ) : (
            changeRequests.map((request) => (
              <div
                key={request.uuid}
                className="mb-2.5"
                data-testid="change-request-notice-item"
              >
                <p className="font-medium mb-1">{request.step_name}</p>
                <RequestBody request={request} />
                {request.due_at && (
                  <p className="mb-0">
                    {translate('Due {date}.', {
                      date: formatDateTime(request.due_at),
                    })}
                  </p>
                )}
              </div>
            ))
          )}
          <p className="mb-0">
            {due
              ? single
                ? translate('Submit the changes by {date}.', {
                    date: formatDateTime(due),
                  })
                : translate(
                    'Submit all the changes together, by {date} at the latest.',
                    { date: formatDateTime(due) },
                  )
              : single
                ? translate('Submit the changes once they are made.')
                : translate(
                    'Submit all the changes together once they are made.',
                  )}
          </p>
        </>
      }
      data-testid="change-request-notice"
    />
  );
};
