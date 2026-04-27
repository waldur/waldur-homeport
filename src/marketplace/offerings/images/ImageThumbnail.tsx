import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { Screenshot } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';

interface ImageThumbnailProps {
  image: Screenshot;
}

const ImageDetailsDialog = lazyComponent(() =>
  import('./ImageDetailsDialog').then((module) => ({
    default: module.ImageDetailsDialog,
  })),
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
