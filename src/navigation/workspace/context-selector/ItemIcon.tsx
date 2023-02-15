import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';

import { getItemAbbreviation } from './utils';

export const ItemIcon = ({ item }) =>
  item.image ? (
    <Image src={item.image} size={40} />
  ) : (
    <div className="symbol symbol-40px">
      <ImagePlaceholder width="40px" height="40px" backgroundColor="#e2e2e2">
        <div className="symbol-label fs-6 fw-bold">
          {getItemAbbreviation(item)}
        </div>
      </ImagePlaceholder>
    </div>
  );
