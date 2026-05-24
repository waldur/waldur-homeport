import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { countLexisLinks } from '@/marketplace/common/api';

import { BasicLexisLinkList } from './BasicLexisLinkList';

export const LexisLinkCard = ({ resource }) => {
  const result = useQuery({
    queryKey: ['LexisLinkCard'],

    queryFn: () => countLexisLinks({ resource_uuid: resource.uuid }),
  });
  const filter = useMemo(() => ({ resource_uuid: resource.uuid }), [resource]);
  if (!result.data) {
    return null;
  }
  return <BasicLexisLinkList filter={filter} />;
};
