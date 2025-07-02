import { FunctionComponent, useMemo } from 'react';
import { Field } from 'redux-form';
import { OrganizationGroup } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface SetAccessPolicyFormContainerProps {
  organizationGroups: OrganizationGroup[];
  submitting: boolean;
}

export const SetAccessPolicyFormContainer: FunctionComponent<
  SetAccessPolicyFormContainerProps
> = ({ organizationGroups, submitting }) => {
  const tableProps = useTable({
    table: 'OrganizationGroups',
    fetchData: () =>
      Promise.resolve({
        rows: organizationGroups,
        totalCount: organizationGroups.length,
      }),
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => row.name,
      },
      {
        title: translate('Parent'),
        render: ({ row }) => row.parent_name || DASH_ESCAPE_CODE,
      },
      {
        title: translate('Select'),
        render: ({ row }) => (
          <Field
            name={row.uuid}
            type="checkbox"
            component="input"
            parse={(value) => !!value}
            format={(value) => !!value}
            props={{
              disabled: submitting,
            }}
          />
        ),

        className: 'text-center',
      },
    ],

    [submitting],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      hasHeaders={false}
      hasActionBar={false}
      verboseName={translate('Organization groups')}
    />
  );
};
