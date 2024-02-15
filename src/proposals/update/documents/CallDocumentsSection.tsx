import { Card, Table } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';
import { RemoveDocumentButton } from '@waldur/proposals/update/documents/RemoveDocumentButton';

import { AttachDocumentsButton } from './AttachDocumentsButton';
import { EditDocumentsButton } from './EditDocumentsButton';

export const CallDocumentsSection = ({ call, refetch }) => {
  return (
    <Card id="documents" className="mb-7">
      <Card.Header className="border-2 border-bottom">
        <Card.Title>
          {call.documents.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('Documents')}</span>
        </Card.Title>
        <div className="card-toolbar">
          <EditDocumentsButton />
          <AttachDocumentsButton call={call} refetch={refetch} />
        </div>
      </Card.Header>
      <Card.Body>
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
      </Card.Body>
    </Card>
  );
};
