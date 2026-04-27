import { Tag } from 'waldur-js-client';

import { ActionsDropdown } from '@/table/ActionsDropdown';

import { TagDeleteButton } from './TagDeleteButton';
import { TagEditButton } from './TagEditButton';

interface TagsRowActionsProps {
  row: Tag;
  refetch: () => void;
}

export const TagsRowActions = ({ row, refetch }: TagsRowActionsProps) => (
  <ActionsDropdown
    row={row}
    refetch={refetch}
    actions={[TagEditButton, TagDeleteButton].filter(Boolean)}
  />
);
