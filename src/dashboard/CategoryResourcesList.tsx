import { FunctionComponent } from 'react';
import { Button } from 'react-bootstrap';
import { useAsyncFn, useEffectOnce } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { loadCategories } from '@waldur/dashboard/api';
import { translate } from '@waldur/i18n';
import { WorkspaceType } from '@waldur/workspace/types';

import { CategoryResources } from './CategoryResources';
import { Scope } from './types';

interface CategoryResourcesListProps<ScopeType = Scope> {
  scope: ScopeType;
  scopeType: WorkspaceType;
}

const LoadingErred = ({ loadData }) => (
  <div className="text-center">
    <h3>{translate('Unable to load charts.')}</h3>
    <Button onClick={loadData}>
      <i className="fa fa-refresh" /> {translate('Reload')}
    </Button>
  </div>
);

export const CategoryResourcesList: FunctionComponent<CategoryResourcesListProps> =
  (props) => {
    const [{ loading, error, value }, callback] = useAsyncFn(
      () => loadCategories(props.scopeType, props.scope),
      [props.scope],
    );
    useEffectOnce(() => {
      callback();
    });

    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <LoadingErred loadData={callback} />;
    }
    return (
      <>
        {Array.isArray(value)
          ? value.map((category, index) => (
              <CategoryResources key={index} category={category} />
            ))
          : null}
      </>
    );
  };
