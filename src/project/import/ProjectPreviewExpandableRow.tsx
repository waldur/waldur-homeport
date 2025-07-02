import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

interface OwnProps {
  columns: Column[];
  row: { uuid; resources: any[] };
}

export const ProjectPreviewExpandableRow: FC<OwnProps> = (props) => {
  const tableProps = useTable({
    table: 'ProjectPreviewResources-' + props.row.uuid,
    fetchData: () =>
      Promise.resolve({
        rows: props.row.resources,
        resultCount: props.row.resources.length,
      }),
  });

  return (
    <ExpandableContainer>
      <Table
        {...tableProps}
        columns={props.columns}
        verboseName={translate('Resources')}
        hasActionBar={false}
        hoverShadow={false}
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
