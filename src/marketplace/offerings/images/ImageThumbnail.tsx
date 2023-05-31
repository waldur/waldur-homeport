import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Image } from '@waldur/marketplace/types';

interface ImageThumbnailProps {
  image: Image;
  onClick(): void;
}

export const ImageThumbnail: FunctionComponent<ImageThumbnailProps> = (
  props,
) => {
  return (
    <img
      src={props.image.thumbnail || props.image.image}
      alt={translate('Image here')}
      onClick={props.onClick}
      style={{ cursor: 'pointer', maxWidth: 100 }}
    />
  );
};
