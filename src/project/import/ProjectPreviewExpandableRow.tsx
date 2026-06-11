import { FC } from 'react';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

interface OwnProps {
  columns: Column[];
  row: { uuid; resources: any[] };
}

export const ProjectPreviewExpandableRow: FC<OwnProps> = (props) => {
  const tableProps = useTable({
    table: 'ProjectPreviewResources-' + props.row.uuid,
    fetchData: createClientPaginatedFetcher(props.row.resources),
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
