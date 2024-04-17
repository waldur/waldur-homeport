import { Card, Table } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { RemoveDocumentButton } from '@waldur/proposals/update/documents/RemoveDocumentButton';

import { AttachDocumentsButton } from './AttachDocumentsButton';

export const CallDocumentsSection = ({ call, refetch }) => {
  return (
    <Card id="documents" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>{translate('Documents')}</Card.Title>
        <div className="card-toolbar">
          <AttachDocumentsButton call={call} refetch={refetch} />
        </div>
      </Card.Header>
      <Card.Body>
        {call.documents.length > 0 ? (
          <Table bordered={true} hover={true} responsive={true}>
            <tbody>
              {call.documents.map((document, i) => (
                <tr key={i}>
                  <td className="col-md-3">
                    {decodeURIComponent(
                      document.file
                        .split('/')
                        .pop()
                        .replace(/_[^_]+\./, '.'),
                    )}
                  </td>
                  <td className="col-md-9">
                    <ExternalLink
                      url={document.file}
                      label={translate('Download')}
                      iconless
                    />
                  </td>
                  <td className="row-actions">
                    <div>
                      <RemoveDocumentButton
                        fileUuid={document.uuid}
                        call={call}
                        refetch={refetch}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center">
            {translate('There are no documents uploaded.')}
          </p>
        )}
      </Card.Body>
    </Card>
  );
};
