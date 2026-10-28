import { FunctionComponent } from 'react';
import { NestedScreenshot } from 'waldur-js-client';

import { useModal } from '@/modal/actions';

import { ImageDetailsDialog } from './ImageDetailsDialog';

interface ImagesTabProps {
  images: NestedScreenshot[];
}

export const ImagesTab: FunctionComponent<ImagesTabProps> = (props) => {
  const { openDialog } = useModal();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5">
      {props.images.map((item, index) => (
        <div key={index} className="text-center">
          <img
            src={item.thumbnail}
            alt="thumb"
            className="img-thumbnail"
            onClick={() =>
              openDialog(ImageDetailsDialog, {
                resolve: item,
              })
            }
            style={{ cursor: 'pointer' }}
            aria-hidden="true"
          />

          <h4 className="mt-2.5">{item.name}</h4>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
};
