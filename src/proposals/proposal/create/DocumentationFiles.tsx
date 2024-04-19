import { Col, Row } from 'react-bootstrap';

import { ExternalLink } from '@waldur/core/ExternalLink';
import { translate } from '@waldur/i18n';

interface DocumentationFilesProps {
  files: Array<{ file: string }>;
}

export const DocumentationFiles = (props: DocumentationFilesProps) =>
  props.files?.length > 0 ? (
    <ul className="text-muted">
      {props.files.map((item, index) => (
        <li key={index}>
          <Row>
            <Col xs={8} md={6} xl={4}>
              {item.file.substring(item.file.lastIndexOf('/') + 1)}
            </Col>
            <Col>
              <ExternalLink
                url={item.file}
                label={translate('Download')}
                iconless
              />
            </Col>
          </Row>
        </li>
      ))}
    </ul>
  ) : null;
