import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { translate } from '@waldur/i18n';

import { CategoryResources, Category } from './CategoryResources';

interface CategoryResourcesListProps<Scope = object> {
  scope: Scope;
  loader(scope: Scope): Promise<Category[]>;
}

const LoadingErred = ({ loadData }) => (
  <div className="text-center">
    <h3>{translate('Unable to load charts.')}</h3>
    <button
      onClick={loadData}
      type="button"
      className="btn btn-default">
      <i className="fa fa-refresh"/>
      {' '}
      {translate('Reload')}
    </button>
  </div>
);

export const CategoryResourcesList = (props: CategoryResourcesListProps) => (
  <Query loader={props.loader} variables={props.scope}>
    {({ loading, data, error, loadData }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <LoadingErred loadData={loadData}/>;
      }
      return (
        <>
          {data.map((category, index) => (
            <CategoryResources key={index} category={category}/>
          ))}
        </>
      );
    }}
  </Query>
);
