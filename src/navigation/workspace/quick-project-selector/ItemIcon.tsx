import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';

import { getItemAbbreviation } from './utils';

export const ItemIcon = ({ item }) =>
  item.image ? (
    <Image src={item.image} size={35} />
  ) : (
    <div className="symbol symbol-35px">
      <ImagePlaceholder width="35px" height="35px" backgroundColor="#e2e2e2">
        <div className="symbol-label fs-6 fw-bold">
          {getItemAbbreviation(item)}
        </div>
      </ImagePlaceholder>
    </div>
  );
