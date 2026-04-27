import { FC, MouseEvent } from 'react';
import { NestedTag } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { Tag } from '@/core/Tag';
import { Tip } from '@/core/Tooltip';

interface TagBadgesProps {
  tags?: NestedTag[];
  className?: string;
  maxTags?: number;
  onTagClick?(tag: NestedTag): void;
}

export const TagBadges: FC<TagBadgesProps> = ({
  tags,
  className = '',
  maxTags,
  onTagClick,
}) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const visibleTags =
    maxTags && tags.length > maxTags ? tags.slice(0, maxTags) : tags;
  const hiddenTags =
    maxTags && tags.length > maxTags ? tags.slice(maxTags) : [];

  const handleClick = (e: MouseEvent, tag: NestedTag) => {
    if (!onTagClick) return;
    e.stopPropagation();
    e.preventDefault();
    onTagClick(tag);
  };

  return (
    <div className={`d-flex flex-wrap gap-1 ${className}`}>
      {visibleTags.map((tag) => (
        <Tag
          key={tag.uuid}
          size="sm"
          className={onTagClick ? 'cursor-pointer' : undefined}
          onClick={onTagClick ? (e) => handleClick(e, tag) : undefined}
        >
          {tag.name}
        </Tag>
      ))}
      {hiddenTags.length > 0 && (
        <Tip
          id="tag-badges-more"
          label={hiddenTags.map((t) => t.name).join(', ')}
        >
          <Badge variant="default" size="sm" outline>
            +{hiddenTags.length}
          </Badge>
        </Tip>
      )}
    </div>
  );
};
