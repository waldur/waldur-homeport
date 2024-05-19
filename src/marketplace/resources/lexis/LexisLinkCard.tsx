import { useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { translate } from '@waldur/i18n';
import { countLexisLinks } from '@waldur/marketplace/common/api';

import { BasicLexisLinkList } from './BasicLexisLinkList';

export const LexisLinkCard = ({ resource }) => {
  const result = useAsync(() =>
    countLexisLinks({ resource_uuid: resource.uuid }),
  );
  const filter = useMemo(() => ({ resource_uuid: resource.uuid }), [resource]);
  if (!result.value) {
    return null;
  }
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <h3>{translate('LEXIS links')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <BasicLexisLinkList filter={filter} />
      </Card.Body>
    </Card>
  );
};
