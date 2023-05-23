import { FunctionComponent, useState } from 'react';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOfferingImages } from '@waldur/marketplace/common/api';
import { Image, Offering } from '@waldur/marketplace/types';

import { CircleProgressStatus } from './CircleProgressStatus';
import { ProviderOfferingDataCard } from './ProviderOfferingDataCard';

interface ProviderOfferingImageGalleryProps {
  offering: Offering;
}

export const ProviderOfferingImageGallery: FunctionComponent<ProviderOfferingImageGalleryProps> =
  ({ offering }) => {
    const [image, setImage] = useState<Image>(null);

    if (!offering) return null;

    const [{ loading, error, value: images }, refetch] = useAsyncFn(
      () => getOfferingImages(offering.uuid),
      [offering],
    );

    useEffectOnce(() => {
      refetch();
    });

    return (
      <ProviderOfferingDataCard
        title={translate('Image gallery')}
        icon="fa fa-picture-o"
        actions={
          <Link
            state="marketplace-offering-images"
            params={{ offering_uuid: offering.uuid }}
            className="btn btn-light mw-100px w-100"
          >
            {translate('Edit')}
          </Link>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={99} />
          </div>
        }
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <LoadingErred loadData={refetch} />
        ) : images?.length ? (
          <>
            <div className="text-center px-5 py-5">
              {image ? (
                <img
                  src={image?.image}
                  className="card-rounded mh-500px mw-800px"
                  alt=""
                />
              ) : (
                <ImagePlaceholder height="400px" width="500px" />
              )}
            </div>

            <div className="d-flex scroll-x pt-2 pb-1">
              <div className="d-flex align-items-stretch w-100">
                <div className="d-flex align-items-center">
                  {images.map((img) => (
                    <button
                      className={`symbol symbol-100px btn border p-4 mx-1 ${
                        image?.uuid === img.uuid ? 'border-primary' : ''
                      }`}
                      key={img.uuid}
                      onClick={() => setImage(img)}
                    >
                      <img src={img.thumbnail} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <h1 className="text-muted display-6 text-center py-4">
            {translate('No image')}
          </h1>
        )}
      </ProviderOfferingDataCard>
    );
  };
