import { Modal } from 'react-bootstrap';

import { Tooltip } from 'waldur-ui';

import { Image } from '@/core/Image';
import { getMarketplaceResourceLogo } from '@/marketplace/resources/details/MarketplaceResourceLogo';

import { ResourceStateField } from '../list/ResourceStateField';

export const ActionDialogHeader = ({
  marketplaceResource,
  name,
}: {
  marketplaceResource;
  name: string;
}) => (
  <Modal.Header closeButton className="without-border pb-0">
    {/* A heading, with the h4 look of Modal.Title's default div. */}
    <Modal.Title as="h2" className="fw-bold h4">
      {marketplaceResource ? (
        <div className="d-flex flex-column-auto align-items-stretch gap-3 flex-grow-1">
          <Tooltip label={marketplaceResource.category_title}>
            <span className="d-inline-flex">
              <Image
                src={getMarketplaceResourceLogo(marketplaceResource)}
                size={24}
                isContain
              />
            </span>
          </Tooltip>
          {name}
          <div>
            <ResourceStateField
              resource={marketplaceResource}
              size="sm"
              shape="pill"
              tone="outline"
            />
          </div>
        </div>
      ) : (
        <>{name}</>
      )}
    </Modal.Title>
  </Modal.Header>
);
