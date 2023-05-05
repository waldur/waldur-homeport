import { FunctionComponent, useState } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { CircleProgressStatus } from './CircleProgressStatus';
import { PublicOfferingDataCard } from './PublicOfferingDataCard';

interface PublicOfferingImageGalleryProps {
  offering: Offering;
}

export const PublicOfferingImageGallery: FunctionComponent<PublicOfferingImageGalleryProps> =
  ({ offering }) => {
    const [image, setImage] = useState(1);

    if (!offering) return null;

    return (
      <PublicOfferingDataCard
        title={translate('Image gallery')}
        icon="fa fa-picture-o"
        actions={
          <Button variant="light" className="mw-100px w-100">
            Edit
          </Button>
        }
        footer={
          <div className="d-flex justify-content-end">
            <CircleProgressStatus progress={99} />
          </div>
        }
      >
        <div className="text-center px-5 py-5">
          <img
            src={offering.image}
            className="card-rounded mw-100 mh-500px"
            alt=""
          />
        </div>

        <div className="d-flex scroll-x pt-2 pb-1">
          <div className="d-flex align-items-stretch w-100">
            <div className="d-flex align-items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <button
                  className={`symbol symbol-100px btn border p-4 mx-1 ${
                    image === i ? 'border-primary' : ''
                  }`}
                  key={i}
                  onClick={() => setImage(i)}
                >
                  <img src={offering.image} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PublicOfferingDataCard>
    );
  };
