import { Table } from 'react-bootstrap';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

export const ProjectUpdateRequestExpandable = ({ row }) => (
  <Table>
    <thead>
      <tr>
        <th>{translate('Field')}</th>
        <th className="col-sm-6">{translate('Old value')}</th>
        <th className="col-sm-6">{translate('New value')}</th>
      </tr>
    </thead>
    <tbody>
      {row.old_name != row.new_name ? (
        <tr>
          <td>{translate('Name')}</td>
          <td>{row.old_name}</td>
          <td>{row.new_name}</td>
        </tr>
      ) : null}
      {row.old_description != row.new_description ? (
        <tr>
          <td>{translate('Description')}</td>
          <td>{row.old_description}</td>
          <td>{row.new_description}</td>
        </tr>
      ) : null}
      {row.old_end_date != row.new_end_date ? (
        <tr>
          <td>{translate('End date')}</td>
          <td>{row.old_end_date ? formatDate(row.old_end_date) : 'N/A'}</td>
          <td>{row.new_end_date ? formatDate(row.new_end_date) : 'N/A'}</td>
        </tr>
      ) : null}
      {row.old_type_name != row.new_type_name ? (
        <tr>
          <td>{translate('Type')}</td>
          <td>{row.old_type_name}</td>
          <td>{row.new_type_name}</td>
        </tr>
      ) : null}
      {row.old_oecd_fos_2007_code != row.new_oecd_fos_2007_code ? (
        <tr>
          <td>{translate('OECD FoS code')}</td>
          <td>{row.old_oecd_fos_2007_code}</td>
          <td>{row.new_oecd_fos_2007_code}</td>
        </tr>
      ) : null}
    </tbody>
  </Table>
);
