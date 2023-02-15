import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

export const ItemIcon = ({ item }) =>
  item.image ? (
    <Image src={item.image} size={60} />
  ) : (
    <div className="symbol symbol-60px">
      <ImagePlaceholder width="60px" height="60px" backgroundColor="#e2e2e2">
        <div className="symbol-label fs-6 fw-bold">
          {getItemAbbreviation(item)}
        </div>
      </ImagePlaceholder>
    </div>
  );
