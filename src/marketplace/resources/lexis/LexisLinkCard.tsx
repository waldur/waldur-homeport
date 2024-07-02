import { useMemo } from 'react';
import { useAsync } from 'react-use';

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
  return <BasicLexisLinkList filter={filter} />;
};
