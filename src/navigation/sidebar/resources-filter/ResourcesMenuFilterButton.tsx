import { FunnelSimpleIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { ALL_RESOURCES_TABLE_ID } from '@waldur/marketplace/resources/list/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { HeaderButtonBullet } from '@waldur/navigation/header/HeaderButtonBullet';
import { selectFiltersStorage } from '@waldur/table/selectors';

const FilterByOrgAndProjectDialog = lazyComponent(() =>
  import('./FilterByOrgAndProjectDialog').then((module) => ({
    default: module.FilterByOrgAndProjectDialog,
  })),
);

export const ResourcesMenuFilterButton = () => {
  const filters = useSelector((state: any) =>
    selectFiltersStorage(state, ALL_RESOURCES_TABLE_ID),
  );
  const values = useMemo(() => {
    if (!filters) return null;
    const project = filters.find((item) => item.name === 'project');
    const organization = filters.find((item) => item.name === 'organization');
    return { project: project?.value, organization: organization?.value };
  }, [filters]);

  const dispatch = useDispatch();
  const callback = (e) => {
    dispatch(
      openModalDialog(FilterByOrgAndProjectDialog, {
        size: 'sm',
        initialValues: values,
      }),
    );
    e.stopPropagation();
  };
  return (
    <button
      type="button"
      className="text-btn menu-btn btn-filter-resources position-relative"
      onClick={callback}
    >
      <FunnelSimpleIcon size={20} weight="bold" />
      {(values?.organization || values?.project) && (
        <HeaderButtonBullet
          size={9}
          blink={false}
          variant="primary"
          className="me-n2 mt-2 border border-2"
        />
      )}
    </button>
  );
};
