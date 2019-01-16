import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';

import { CategoryResources, Category } from './CategoryResources';

interface CategoryResourcesListProps<Scope = object> {
  scope: Scope;
  loader(scope: Scope): Promise<Category[]>;
}

export const CategoryResourcesList = (props: CategoryResourcesListProps) => (
  <Query loader={props.loader} variables={props.scope}>
    {({ loading, data }) => {
      if (loading) {
        return <LoadingSpinner/>;
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
