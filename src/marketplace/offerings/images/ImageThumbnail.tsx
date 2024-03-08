import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Image } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';

interface ImageThumbnailProps {
  image: Image;
}

const ImageDetailsDialog = lazyComponent(
  () => import('./ImageDetailsDialog'),
  'ImageDetailsDialog',
);

export const ImageThumbnail: FunctionComponent<ImageThumbnailProps> = (
  props,
) => {
  const dispatch = useDispatch();
  return (
    <img
      src={props.image.thumbnail || props.image.image}
      alt={translate('Image here')}
      onClick={() =>
        dispatch(
          openModalDialog(ImageDetailsDialog, {
            resolve: props.image,
          }),
        )
      }
      style={{ cursor: 'pointer', maxWidth: 100 }}
      aria-hidden="true"
    />
  );
};
