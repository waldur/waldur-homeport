import classNames from 'classnames';
import { useState, useCallback, FunctionComponent } from 'react';
import { Col, ListGroupItem, Stack } from 'react-bootstrap';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { Category, Offering } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

import { BaseList } from './BaseList';

const EmptyOfferingsPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper text-danger">
    {translate('There are no offerings yet for this category.')}
  </div>
);

const EmptyOfferingListPlaceholder: FunctionComponent = () => (
  <div className="message-wrapper ellipsis">
    {translate('There are no offerings.')}
  </div>
);

const OfferingListItem = ({
  item,
  onClick,
  selectedItem,
}: {
  item: Offering;
  onClick;
  selectedItem: Offering;
}) => (
  <Tip
    label={
      item.state === 'Paused' ? item.paused_reason || item.state : undefined
    }
    id={`tip-${item.uuid}`}
    data-kt-menu-dismiss="true"
  >
    <ListGroupItem
      as={Link}
      data-uuid={item.uuid}
      className={classNames({
        active: selectedItem && item.uuid === selectedItem.uuid,
      })}
      onClick={() => onClick(item)}
      disabled={item.state === 'Paused'}
      state="marketplace-offering-customer"
      params={{ uuid: item.customer_uuid, offering_uuid: item.uuid }}
    >
      <Stack direction="horizontal" gap={4}>
        {item.image ? (
          <div className="symbol symbol-40px">
            <img src={item.image} />
          </div>
        ) : (
          <ImagePlaceholder
            width="40px"
            height="40px"
            backgroundColor="#e2e2e2"
          />
        )}
        <div>
          <h6 className="title ellipsis mb-0">{truncate(item.name, 40)}</h6>
          <p className="description ellipsis fs-7 mb-0">
            {truncate(item.description, 120)}
          </p>
        </div>
      </Stack>
    </ListGroupItem>
  </Tip>
);

export const OfferingsPanel: FunctionComponent<{
  offerings: Offering[];
  customer: Customer;
  category: Category;
}> = ({ offerings, customer, category }) => {
  const [selectedOffering, selectOffering] = useState<Offering>();

  const handleOfferingClick = useCallback((offering: Offering) => {
    selectOffering(offering);
  }, []);

  return (
    <Col xs={6} className="offering-listing">
      {offerings?.length > 0 ? (
        <>
          <BaseList
            items={offerings}
            selectedItem={selectedOffering}
            selectItem={handleOfferingClick}
            EmptyPlaceholder={EmptyOfferingListPlaceholder}
            ItemComponent={OfferingListItem}
          />
          <div className="offerings-footer">
            <div className="text-center">
              <span data-kt-menu-dismiss="true">
                <Link
                  state="marketplace-category-customer"
                  params={{
                    uuid: customer.uuid,
                    category_uuid: category?.uuid,
                  }}
                  className="btn btn-dark"
                >
                  {translate('See all offerings')}
                </Link>
              </span>
            </div>
          </div>
        </>
      ) : (
        <EmptyOfferingsPlaceholder />
      )}
    </Col>
  );
};
