import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import { FC, useState } from 'react';
import { QueryFunction } from 'react-query';

import { translate } from '@waldur/i18n';

import { ResourcesList } from './ResourcesList';
import { DataPage } from './types';

interface ResourcesSectionProps {
  loadData: QueryFunction<DataPage>;
  queryKey: string;
  title: string;
  canAdd?: boolean;
}

export const ResourcesSection: FC<ResourcesSectionProps> = ({
  loadData,
  queryKey,
  title,
  canAdd,
}) => {
  const [toggle, setToggle] = useState(false);
  const { state } = useCurrentStateAndParams();
  return (
    <>
      <tr>
        <td></td>
        <td onClick={() => setToggle(!toggle)} className="cursor-pointer">
          {title}{' '}
          <i className={toggle ? 'fa fa-angle-down' : 'fa fa-angle-right'}></i>
        </td>
        <td></td>
        <td>
          <UISref to={state.name} params={{ tab: queryKey }}>
            <a className="cursor-pointer text-dark text-decoration-underline text-hover-primary">
              {translate('See all')}
            </a>
          </UISref>{' '}
          {canAdd && (
            <a className="cursor-pointer text-dark text-decoration-underline text-hover-primary">
              {translate('Add new')}
            </a>
          )}
        </td>
      </tr>
      {toggle && <ResourcesList loadData={loadData} queryKey={queryKey} />}
    </>
  );
};
