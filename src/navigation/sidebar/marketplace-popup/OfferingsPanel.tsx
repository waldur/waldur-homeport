import classNames from 'classnames';
import { useState, useCallback, FunctionComponent, useMemo } from 'react';
import { ListGroupItem, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { ImagePlaceholder } from '@waldur/core/ImagePlaceholder';
import { Link } from '@waldur/core/Link';
import { TextWithoutFormatting } from '@waldur/core/TextWithoutFormatting';
import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { offeringCategoryStateSelector } from '@waldur/marketplace/links/CategoryLink';
import { offeringDetailsSelector } from '@waldur/marketplace/links/OfferingLink';
import { Category, Offering } from '@waldur/marketplace/types';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';
import { getCustomer } from '@waldur/workspace/selectors';

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

const OfferingListItem: FunctionComponent<{
  item: Offering;
  onClick;
  selectedItem: Offering;
  linkState: string;
}> = ({ item, onClick, selectedItem, linkState }) => {
  const abbreviation = useMemo(() => getItemAbbreviation(item), [item]);

  return (
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
        state={linkState}
        params={{ offering_uuid: item.uuid }}
      >
        <Stack direction="horizontal" gap={4}>
          {item.image ? (
            <div className="symbol symbol-40px">
              <img src={item.image} />
            </div>
          ) : (
            <div className="symbol">
              <ImagePlaceholder
                width="50px"
                height="50px"
                backgroundColor="#e2e2e2"
              >
                {abbreviation && (
                  <div className="symbol-label fs-6 fw-bold">
                    {abbreviation}
                  </div>
                )}
              </ImagePlaceholder>
            </div>
          )}
          <div>
            <h6 className="title ellipsis mb-0">{truncate(item.name, 40)}</h6>
            <p className="description ellipsis fs-7 mb-0">
              <TextWithoutFormatting html={truncate(item.description, 120)} />
            </p>
          </div>
        </Stack>
      </ListGroupItem>
    </Tip>
  );
};

export const OfferingsPanel: FunctionComponent<{
  offerings: Offering[];
  category: Category;
}> = ({ offerings, category }) => {
  const [selectedOffering, selectOffering] = useState<Offering>();
  const customer = useSelector(getCustomer);

  const handleOfferingClick = useCallback((offering: Offering) => {
    selectOffering(offering);
  }, []);

  const offeringDetailsState = useSelector(offeringDetailsSelector);
  const offeringCategoryState = useSelector(offeringCategoryStateSelector);

  return (
    <div className="offering-listing">
      {offerings?.length > 0 ? (
        <>
          <BaseList
            items={offerings}
            selectedItem={selectedOffering}
            selectItem={handleOfferingClick}
            EmptyPlaceholder={EmptyOfferingListPlaceholder}
            ItemComponent={OfferingListItem}
            linkState={offeringDetailsState}
          />
          <div className="offerings-footer">
            <div className="text-center">
              <span data-kt-menu-dismiss="true">
                <Link
                  state={offeringCategoryState}
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
    </div>
  );
};
