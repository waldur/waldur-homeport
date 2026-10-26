import classNames from 'classnames';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';

import { getItemAbbreviation } from './utils';

export const ItemImage = ({ item, circle = false, className = '' }) =>
  item.image ? (
    <Image src={item.image} size={40} circle={circle} classes={className} />
  ) : (
    <ImagePlaceholder
      width="40px"
      height="40px"
      circle={circle}
      className={classNames('text-xs', className)}
    >
      {getItemAbbreviation(item)}
    </ImagePlaceholder>
  );
