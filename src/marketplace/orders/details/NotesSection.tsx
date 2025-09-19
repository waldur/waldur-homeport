import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Card } from 'react-bootstrap';
import { OrderDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';

export const NotesSection = ({ order }: { order: OrderDetails }) => {
  // Destructure the relevant fields from the order object
  const { request_comment, attachment } = order;

  // If both fields are empty, show a placeholder message.
  if (!request_comment && !attachment) {
    return (
      <Card className="card-bordered">
        <Card.Header className="custom-card-header custom-padding-zero">
          <Card.Title>
            <h3>{translate('Notes and attachment')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <NoResult
            title={translate(
              'No notes or attachment were provided for this order',
            )}
            buttonTitle={null}
            message={null}
          />
        </Card.Body>
      </Card>
    );
  }

  // Otherwise, display the available information.
  return (
    <Card className="card-bordered">
      <Card.Header className="custom-card-header custom-padding-zero">
        <Card.Title>
          <h3>{translate('Notes and attachment')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <dl className="row">
          {request_comment && (
            <>
              <dt className="col-sm-3">{translate('Notes')}</dt>
              <dd className="col-sm-9" style={{ whiteSpace: 'pre-wrap' }}>
                {request_comment}
              </dd>
            </>
          )}

          {attachment && (
            <>
              <dt className="col-sm-3">{translate('Attachment')}</dt>
              <dd className="col-sm-9">
                <a
                  className="btn btn-outline btn-outline-default"
                  href={attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="svg-icon svg-icon-2">
                    <DownloadSimpleIcon weight="bold" />
                  </span>{' '}
                  {translate('Download')}
                </a>
              </dd>
            </>
          )}
        </dl>
      </Card.Body>
    </Card>
  );
};
