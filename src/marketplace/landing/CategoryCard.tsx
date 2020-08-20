import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { redirectToMarketplaceCategory } from '@waldur/marketplace/landing/utils';
import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { Category } from '@waldur/marketplace/types';
import './CategoryCard.scss';
import { openModalDialog } from '@waldur/modal/actions';
import { SelectOrganizationDialog } from '@waldur/user/SelectOrganizationDialog';
import { getUserCustomerPermissions } from '@waldur/workspace/selectors';

interface CategoryCardProps {
  category: Category;
  hideCounter?: boolean;
  hideCategoryWithNoOfferings?: boolean;
  userDashboardView?: boolean;
}

export const CategoryCard = (props: CategoryCardProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const customerPermissions: any[] = useSelector(getUserCustomerPermissions);
  const changeWorkspace = (categoryUuid: string) => {
    if (!props.userDashboardView) {
      return;
    }
    if (customerPermissions.length > 1) {
      dispatch(
        openModalDialog(SelectOrganizationDialog, {
          size: 'lg',
          resolve: {
            router,
            customerPermissions,
            categoryUuid,
          },
        }),
      );
    } else {
      redirectToMarketplaceCategory(
        router,
        customerPermissions[0].customer_uuid,
        categoryUuid,
      );
    }
  };
  return props.category.offering_count !== 0 ||
    !props.hideCategoryWithNoOfferings ? (
    <div
      className="category-card"
      style={{ height: props.hideCategoryWithNoOfferings ? '110px' : '150px' }}
    >
      <CategoryLink
        className="category-thumb"
        category_uuid={props.category.uuid}
      >
        <OfferingLogo
          src={props.category.icon}
          onClick={() => changeWorkspace(props.category.uuid)}
        />
      </CategoryLink>
      <div className="category-card-body">
        <h3
          className="category-title"
          onClick={() => changeWorkspace(props.category.uuid)}
        >
          <CategoryLink category_uuid={props.category.uuid}>
            {props.category.title}
          </CategoryLink>
        </h3>
        {!props.hideCounter && `${props.category.offering_count} items`}
      </div>
    </div>
  ) : null;
};
