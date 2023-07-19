import { Image } from '@waldur/core/Image';
import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

export const ItemIcon = ({ item }) =>
  item.image ? (
    <Image src={item.image} size={55} />
  ) : (
    <div className="symbol symbol-55px">
      <ImagePlaceholder width="55px" height="55px" backgroundColor="#e2e2e2">
        <div className="symbol-label fs-6 fw-bold">
          {getItemAbbreviation(item)}
        </div>
      </ImagePlaceholder>
    </div>
  );
