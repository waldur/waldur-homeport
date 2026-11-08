import { FunctionComponent } from 'react';
import { Screenshot } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

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
  const { openDialog } = useModal();
  return (
    <img
      src={props.image.thumbnail || props.image.image}
      alt={translate('Image here')}
      onClick={() =>
        openDialog(ImageDetailsDialog, {
          resolve: props.image,
        })
      }
      className="cursor-pointer max-w-25"
      aria-hidden="true"
    />
  );
};
