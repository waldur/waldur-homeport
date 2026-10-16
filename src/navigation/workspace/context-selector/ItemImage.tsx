import classNames from 'classnames';

import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';

import { getItemAbbreviation } from './utils';

export const ItemImage = ({ item, circle = false, className = '' }) =>
  item.image ? (
    <Image src={item.image} size={40} circle={circle} classes={className} />
  ) : (
    <div
      className={classNames(
        'symbol symbol-40px',
        circle && 'symbol-circle',
        className,
      )}
    >
      <ImagePlaceholder
        width="40px"
        height="40px"
        circle={circle}
        className="text-xs"
      >
        {getItemAbbreviation(item)}
      </ImagePlaceholder>
    </div>
  );
