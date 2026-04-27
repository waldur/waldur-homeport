import { Modal } from 'react-bootstrap';

import { Image } from '@/core/Image';
import { Tip } from '@/core/Tooltip';
import { getMarketplaceResourceLogo } from '@/marketplace/resources/details/MarketplaceResourceLogo';

import { ResourceStateField } from '../list/ResourceStateField';

export const ActionDialogHeader = ({
  marketplaceResource,
  name,
}: {
  marketplaceResource;
  name: string;
}) => (
  <Modal.Header className="without-border pb-0">
    <Modal.Title className="fw-bold">
      {marketplaceResource ? (
        <div className="d-flex flex-column-auto align-items-stretch gap-3 flex-grow-1">
          <Tip label={marketplaceResource.category_title} id="resource-tooltip">
            <Image
              src={getMarketplaceResourceLogo(marketplaceResource)}
              size={24}
              isContain
            />
          </Tip>
          {name}
          <div>
            <ResourceStateField
              resource={marketplaceResource}
              size="sm"
              pill
              outline
            />
          </div>
        </div>
      ) : (
        <>{name}</>
      )}
    </Modal.Title>
  </Modal.Header>
);
