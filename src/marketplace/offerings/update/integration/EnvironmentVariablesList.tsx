import { FunctionComponent } from 'react';

import { Table, TableBody, TableCell, TableRow } from 'waldur-ui';

import { translate } from '@/i18n';

import { EnvironmentVariablePanel } from './EnvironmentVariablePanel';

export const EnvironmentVariablesList: FunctionComponent<any> = (props) => (
  <Table density="compact">
    <TableBody>
      {props.fields.length ? (
        props.fields.map((variable, index) => (
          <EnvironmentVariablePanel
            key={index}
            variable={variable}
            index={index}
            onRemove={props.fields.remove}
          />
        ))
      ) : (
        <TableRow>
          <TableCell className="text-center text-quaternary">
            {translate('No variable defined')}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);
