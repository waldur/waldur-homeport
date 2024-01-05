import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { countLexisLinks } from '@waldur/marketplace/common/api';
import { LexisLinkList } from '@waldur/marketplace/resources/lexis/LexisLinkList';

export const LexisLinkCard = ({ resource }) => {
  const result = useAsync(() =>
    countLexisLinks({ resource_uuid: resource.uuid }),
  );
  if (!result.value) {
    return null;
  }
  return (
    <Card className="mb-10" id="lexis-links">
      <Card.Header>
        <Card.Title>
          <h3>{translate('LEXIS links')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <LexisLinkList resource={resource} />
      </Card.Body>
    </Card>
  );
};
