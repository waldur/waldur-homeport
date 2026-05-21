import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import { OpenstackImagesListData } from 'waldur-js-client';

import {
  OpenstackImagesFilter,
  selectOpenstackImagesFilter,
  OpenstackImagesFilterFormId,
} from '@/table/generated/OpenstackImagesFilter';

import { TenantImagesList } from './TenantImagesList';

const TenantImagesTableTable: FunctionComponent<{ resourceScope }> = ({
  resourceScope,
}) => {
  const { values } = useFormState();

  const filterValues = useMemo(
    () => selectOpenstackImagesFilter(values),
    [values],
  );

  const filter = useMemo(
    (): OpenstackImagesListData['query'] => ({
      tenant_uuid: resourceScope.uuid,
      ...filterValues,
    }),
    [resourceScope?.uuid, filterValues],
  );
  return (
    <TenantImagesList filter={filter} filters={<OpenstackImagesFilter />} />
  );
};

export const TenantImagesTable = (props) => (
  <Form
    id={OpenstackImagesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <TenantImagesTableTable {...props} />}
  </Form>
);
