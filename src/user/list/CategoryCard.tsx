import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { CategoryLink } from '@waldur/marketplace/links/CategoryLink';
import { Category } from '@waldur/marketplace/types';
import '@waldur/marketplace/landing/CategoryCard.scss';
import { openModalDialog } from '@waldur/modal/actions';
import { stateGo } from '@waldur/store/coreSaga';
import { ORGANIZATION_ROUTE, PROJECT_ROUTE } from '@waldur/user/constants';
import { SelectAffiliationDialog } from '@waldur/user/SelectAffiliationDialog';
import {
  getUserCustomerPermissions,
  getUserProjectPermissions,
} from '@waldur/workspace/selectors';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard = (props: CategoryCardProps) => {
  const dispatch = useDispatch();
  const customerPermissions: any[] = useSelector(getUserCustomerPermissions);
  const projectPermissions: any[] = useSelector(getUserProjectPermissions);
  const changeWorkspace = (categoryUuid: string) => {
    if (
      (customerPermissions.length === 1 && projectPermissions.length === 0) ||
      (customerPermissions.length === 0 && projectPermissions.length === 1)
    ) {
      dispatch(
        stateGo(
          customerPermissions.length ? ORGANIZATION_ROUTE : PROJECT_ROUTE,
          {
            uuid: customerPermissions.length
              ? customerPermissions[0].customer_uuid
              : projectPermissions[0].project_uuid,
            category_uuid: categoryUuid,
          },
        ),
      );
    } else {
      dispatch(
        openModalDialog(SelectAffiliationDialog, {
          size: 'lg',
          resolve: {
            customerPermissions,
            projectPermissions,
            categoryUuid,
          },
        }),
      );
    }
  };
  return (
    <div className="category-card" style={{ height: '122px' }}>
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
      </div>
    </div>
  );
};
