import type { CourseAccount } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const CourseAccountExpandableRow = ({ row }: { row: CourseAccount }) => (
  <ExpandableContainer>
    <PropertyList variant="summary">
      <PropertyItem label={translate('Description')} value={row.description} />
    </PropertyList>
  </ExpandableContainer>
);
