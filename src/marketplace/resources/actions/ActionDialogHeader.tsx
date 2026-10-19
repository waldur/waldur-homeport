import { ModalHeader, ModalTitle, Tooltip } from 'waldur-ui';

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
  <ModalHeader closeButton className="pb-0">
    {/* A heading, at the 16.25px of Bootstrap's h4 look it used to borrow. */}
    <ModalTitle as="h2" className="text-[16.25px]">
      {marketplaceResource ? (
        <div className="flex flex-column-auto items-stretch gap-3 grow">
          <Tooltip label={marketplaceResource.category_title}>
            <span className="inline-flex">
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
    </ModalTitle>
  </ModalHeader>
);
