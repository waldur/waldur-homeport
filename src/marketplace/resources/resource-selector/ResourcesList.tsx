import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { useState, useCallback, FunctionComponent } from 'react';
import { ListGroup, ListGroupItem, Stack } from 'react-bootstrap';

import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { translate } from '@waldur/i18n';

import { Resource } from '../types';

import { ItemIcon } from './ItemIcon';

const iconEmpty = require('@waldur/navigation/header/file-search.svg');

const ResourceListItem = ({ item, loading }) => (
  <Stack direction="horizontal" gap={5} title={item.name}>
    <ItemIcon item={item} />
    <div className="overflow-hidden">
      <p className="title fs-4 ellipsis mb-0">{item.name}</p>
      <small className="ellipsis">{item.category_title}</small>
    </div>
    <span className="ms-auto">{loading && <LoadingSpinnerIcon />}</span>
  </Stack>
);

export const ResourcesList: FunctionComponent<{
  resources: Resource[];
  loading?: boolean;
}> = ({ resources, loading }) => {
  const router = useRouter();
  const { state, params } = useCurrentStateAndParams();

  const [redirecting, setRedirecting] = useState('');

  const handleItemSelect = useCallback(
    (resource) => {
      if (params?.resource_uuid === resource.uuid) {
        return;
      }
      setRedirecting(resource.uuid);
      router.stateService
        .go('marketplace-project-resource-details', {
          uuid: resource.project_uuid,
          resource_uuid: resource.uuid,
        })
        .catch(() => {
          setRedirecting('');
        });
    },
    [router, state, setRedirecting],
  );

  return (
    <div className="resource-listing">
      {!isEmpty(resources) && Array.isArray(resources) ? (
        <div className="scroll-y mh-200px mh-lg-350px min-h-100px">
          <ListGroup variant="flush">
            {resources.map((item) => (
              <ListGroupItem
                key={item.uuid}
                data-uuid={item.uuid}
                action
                className={classNames({
                  active: item.uuid == params?.resource_uuid,
                })}
                onClick={() => handleItemSelect(item)}
              >
                <ResourceListItem
                  item={item}
                  loading={item.uuid === redirecting}
                />
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      ) : null}
      <div
        className={classNames('text-center', {
          'd-none': !isEmpty(resources) || loading,
        })}
      >
        <div className="pt-10 pb-10">
          <InlineSVG path={iconEmpty} className="svg-icon-4x opacity-50" />
        </div>

        <div className="pb-15 fw-bold">
          <h3 className="text-gray-600 fs-5 mb-2">
            {translate('No result found')}
          </h3>
          <div className="text-muted fs-7">
            {translate('Please try again with a different query')}
          </div>
        </div>
      </div>
    </div>
  );
};
