import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';

export const ProjectUpdateRequestExpandable = ({ row }) => (
  <Table density="compact">
    <TableHeader>
      <TableRow>
        <TableHead>{translate('Field')}</TableHead>
        <TableHead className="sm:w-6/12">{translate('Old value')}</TableHead>
        <TableHead className="sm:w-6/12">{translate('New value')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {row.old_name != row.new_name ? (
        <TableRow>
          <TableCell>{translate('Name')}</TableCell>
          <TableCell>{row.old_name}</TableCell>
          <TableCell>{row.new_name}</TableCell>
        </TableRow>
      ) : null}
      {row.old_description != row.new_description ? (
        <TableRow>
          <TableCell>{translate('Description')}</TableCell>
          <TableCell>{row.old_description}</TableCell>
          <TableCell>{row.new_description}</TableCell>
        </TableRow>
      ) : null}
      {row.old_end_date != row.new_end_date ? (
        <TableRow>
          <TableCell>{translate('End date')}</TableCell>
          <TableCell>
            {row.old_end_date ? formatDate(row.old_end_date) : 'N/A'}
          </TableCell>
          <TableCell>
            {row.new_end_date ? formatDate(row.new_end_date) : 'N/A'}
          </TableCell>
        </TableRow>
      ) : null}
      {row.old_type_name != row.new_type_name ? (
        <TableRow>
          <TableCell>{translate('Type')}</TableCell>
          <TableCell>{row.old_type_name}</TableCell>
          <TableCell>{row.new_type_name}</TableCell>
        </TableRow>
      ) : null}
      {row.old_oecd_fos_2007_code != row.new_oecd_fos_2007_code ? (
        <TableRow>
          <TableCell>{translate('OECD FoS code')}</TableCell>
          <TableCell>
            {row.old_oecd_fos_2007_code}: {row.old_oecd_fos_2007_label}
          </TableCell>
          <TableCell>
            {row.new_oecd_fos_2007_code}: {row.new_oecd_fos_2007_label}
          </TableCell>
        </TableRow>
      ) : null}
      {row.old_is_industry != row.new_is_industry ? (
        <TableRow>
          <TableCell>{translate('Industry project')}</TableCell>
          <TableCell>{row.old_is_industry}</TableCell>
          <TableCell>{row.new_is_industry}</TableCell>
        </TableRow>
      ) : null}
    </TableBody>
  </Table>
);
