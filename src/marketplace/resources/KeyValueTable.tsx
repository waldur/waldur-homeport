import { FunctionComponent } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';

export const KeyValueTable: FunctionComponent<any> = (props) => (
  <Table density="normal">
    <TableHeader>
      <TableRow>
        <TableHead>{translate('Key')}</TableHead>
        <TableHead>{translate('Value')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Object.keys(props.items).map((key) => (
        <TableRow key={key}>
          <TableCell className="font-medium text-primary">{key}</TableCell>
          <TableCell>
            {typeof props.items[key] === 'object' &&
            props.items[key] !== null ? (
              <pre>{JSON.stringify(props.items[key], null, 2)}</pre>
            ) : typeof props.items[key] === 'boolean' ? (
              props.items[key] ? (
                translate('True')
              ) : (
                translate('False')
              )
            ) : (
              props.items[key]
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
