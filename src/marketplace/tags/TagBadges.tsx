import { FC } from 'react';
import { NestedTag } from 'waldur-js-client';

import { Tag } from '@waldur/core/Tag';

interface TagBadgesProps {
  tags?: NestedTag[];
  className?: string;
}

export const TagBadges: FC<TagBadgesProps> = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={`d-flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => (
        <Tag key={tag.uuid} size="sm">
          {tag.name}
        </Tag>
      ))}
    </div>
  );
};
