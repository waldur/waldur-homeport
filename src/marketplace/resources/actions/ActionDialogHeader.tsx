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
  <Modal.Header className="without-border pb-0">
    <Modal.Title className="fw-bold">
      {marketplaceResource ? (
        <div className="d-flex flex-column-auto align-items-stretch gap-3 flex-grow-1">
          <Tooltip label={marketplaceResource.category_title}>
            <Image
              src={getMarketplaceResourceLogo(marketplaceResource)}
              size={24}
              isContain
            />
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
