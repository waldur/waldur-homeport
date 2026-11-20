import type { CourseAccount } from 'waldur-js-client';

import { SingleProperty } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const CourseAccountExpandableRow = ({ row }: { row: CourseAccount }) => (
  <ExpandableContainer>
    <SingleProperty label={translate('Description')} value={row.description} />
  </ExpandableContainer>
);
