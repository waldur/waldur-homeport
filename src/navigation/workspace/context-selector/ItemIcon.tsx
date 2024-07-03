import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';

import { getItemAbbreviation } from './utils';

export const ItemIcon = ({ item, circle = false, className = '' }) =>
  item.image ? (
    <Image src={item.image} size={40} circle={circle} classes={className} />
  ) : (
    <div
      className={
        `symbol symbol-40px ${className}` + (circle ? ' symbol-circle' : '')
      }
    >
      <ImagePlaceholder
        width="40px"
        height="40px"
        backgroundColor="#F1F7EF"
        circle={circle}
        className="fs-7"
      >
        {getItemAbbreviation(item)}
      </ImagePlaceholder>
    </div>
  );
