import { PlusCircleIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { useMemo } from 'react';
import {
  marketplacePublicOfferingsList,
  MarketplacePublicOfferingsListData,
} from 'waldur-js-client';

import { Tooltip } from 'waldur-ui';

import {
  AsyncSearchBox,
  AsyncSearchBoxItemProps,
} from '@/core/async/AsyncSearchBox';
import { Image } from '@/core/Image';
import { ImagePlaceholder } from '@/core/ImagePlaceholder';
import { Link } from '@/core/Link';
import { TextWithoutFormatting } from '@/core/TextWithoutFormatting';
import { truncate } from '@/core/utils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { getItemAbbreviation } from '@/navigation/workspace/context-selector/utils';
import { useCustomer, useProject } from '@/workspace/hooks';

/** An offering among the results: it opens the offering's details page. */
export interface OfferingSearchItem {
  to: string;
  params: { uuid: string };
  name: string;
  description?: string;
  thumbnail?: string;
}

export const getOfferingSearchItem = (row: {
  uuid?: string;
  name?: string;
  description?: string;
  thumbnail?: string;
}): OfferingSearchItem => ({
  to: 'public-offering.marketplace-public-offering',
  params: { uuid: row.uuid },
  name: row.name,
  description: row.description,
  thumbnail: row.thumbnail,
});

export const offeringSearchItemToString = (item: OfferingSearchItem) =>
  item.name;

/**
 * A row of the results: the option is the link to the offering's details,
 * so a pointer can still open it in a new tab. An option takes no
 * interactive children, so "Add resource" sits beside it, for the pointer
 * only; the keyboard reaches it on the details page.
 */
export const OfferingSearchResult = ({
  item,
  highlighted,
  itemProps,
  close,
}: AsyncSearchBoxItemProps<OfferingSearchItem>) => {
  const abbreviation = useMemo(() => getItemAbbreviation(item), [item]);

  return (
    <div
      className={classNames(
        // The hover background, also on the highlighted row, so the keyboard
        // highlight looks like the pointer's; the brand bar marks it besides.
        'flex items-center pe-3 hover:bg-[var(--bg-brand-primary-alt)] [&.active]:bg-[var(--bg-brand-primary-alt)]',
        highlighted && 'active shadow-[inset_3px_0_0_var(--brand-color)]',
      )}
    >
      <Link
        {...itemProps}
        state={item.to}
        params={item.params}
        // Focus stays in the search box; the option is highlighted through
        // aria-activedescendant, not focused.
        tabIndex={-1}
        className="flex grow min-w-0 items-center text-brand ps-3 pe-1.5 py-1.5"
      >
        {/* Decorative: the name follows. */}
        <span aria-hidden="true" className="shrink-0 me-3">
          {item.thumbnail ? (
            <Image src={item.thumbnail} size={24} circle />
          ) : (
            <ImagePlaceholder
              width="24px"
              height="24px"
              circle
              className="text-xs"
            >
              {abbreviation}
            </ImagePlaceholder>
          )}
        </span>
        {/* Blocks, not spans, so the option's name has a break between
            them. */}
        <div className="flex flex-col min-w-0">
          <div className="text-base ellipsis">{item.name}</div>
          {Boolean(item.description) && (
            <div className="text-xs text-quaternary ellipsis">
              <TextWithoutFormatting html={truncate(item.description, 60)} />
            </div>
          )}
        </div>
      </Link>
      {!isFeatureVisible(MarketplaceFeatures.catalogue_only) && (
        <Tooltip label={translate('Add resource')}>
          <span aria-hidden="true" className="shrink-0">
            <Link
              state="marketplace-offering-public"
              params={{ offering_uuid: item.params.uuid }}
              buttonVariant="text-primary"
              buttonSize="sm"
              buttonIconOnly
              tabIndex={-1}
              onClick={close}
            >
              <PlusCircleIcon weight="bold" size={19.5} />
            </Link>
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export const OfferingsSearchBox = () => {
  const customer = useCustomer();
  const project = useProject();

  const params = useMemo(() => {
    const field = [
      'uuid',
      'name',
      'description',
      'thumbnail',
      'customer_name',
      'customer_uuid',
      'state',
      'paused_reason',
    ] satisfies MarketplacePublicOfferingsListData['query']['field'];

    return {
      o: ['-created'],
      state: ['Active', 'Paused'],
      field,
      allowed_customer_uuid: customer?.uuid,
      project_uuid: project?.uuid,
    } satisfies MarketplacePublicOfferingsListData['query'];
  }, [customer, project]);

  return (
    <AsyncSearchBox
      fetcher={marketplacePublicOfferingsList}
      queryKey="marketplace-public-offerings"
      queryField="keyword"
      params={params}
      getItem={getOfferingSearchItem}
      itemToString={offeringSearchItemToString}
      renderItem={(props) => <OfferingSearchResult {...props} />}
      placeholder={translate('Search offerings...')}
      emptyMessage={translate(
        'No offerings match your search. To find organizations, projects or resources, use the search in the top bar.',
      )}
      wrapperClassName="landing-hero__search-box w-full max-w-[432px] px-3"
    />
  );
};
