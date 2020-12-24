import { triggerTransition } from '@uirouter/redux';
import { FunctionComponent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import '@waldur/marketplace/landing/CategoryCard.scss';
import { Category } from '@waldur/marketplace/types';
import { openModalDialog } from '@waldur/modal/actions';
import { ORGANIZATION_ROUTE, PROJECT_ROUTE } from '@waldur/user/constants';
import {
  getUserCustomerPermissions,
  getUserProjectPermissions,
} from '@waldur/workspace/selectors';

const SelectAffiliationDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SelectAffiliationDialog" */ '@waldur/user/SelectAffiliationDialog'
    ),
  'SelectAffiliationDialog',
);
interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: FunctionComponent<CategoryCardProps> = (props) => {
  const dispatch = useDispatch();
  const customerPermissions: any[] = useSelector(getUserCustomerPermissions);
  const projectPermissions: any[] = useSelector(getUserProjectPermissions);
  const changeWorkspace = (categoryUuid: string) => {
    if (
      (customerPermissions.length === 1 && projectPermissions.length === 0) ||
      (customerPermissions.length === 0 && projectPermissions.length === 1)
    ) {
      dispatch(
        triggerTransition(
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
      <div className="category-thumb">
        <OfferingLogo
          src={props.category.icon}
          onClick={() => changeWorkspace(props.category.uuid)}
        />
      </div>
      <div className="category-card-body">
        <h3
          className="category-title"
          onClick={() => changeWorkspace(props.category.uuid)}
        >
          {props.category.title}
        </h3>
      </div>
    </div>
  );
};
