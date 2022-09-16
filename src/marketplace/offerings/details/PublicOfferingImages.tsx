import { FunctionComponent, useState } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';

interface PublicOfferingImagesProps {
  offering: Offering;
}

export const PublicOfferingImages: FunctionComponent<PublicOfferingImagesProps> =
  ({ offering }) => {
    const [image, setImage] = useState(1);

    return (
      <Card className="mb-10" id="images">
        <Card.Body>
          <PublicOfferingCardTitle>
            {translate('Images')}
          </PublicOfferingCardTitle>

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
        </Card.Body>
      </Card>
    );
  };
