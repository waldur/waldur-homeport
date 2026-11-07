import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { translate } from '@/i18n';

import { SchemaProperty } from './types';

export const VariablesPane = ({ schema }) => (
  <Table density="compact" striped>
    <TableHeader>
      <TableRow>
        <TableHead>{translate('Variable')}</TableHead>
        <TableHead>{translate('Type')}</TableHead>
        <TableHead>{translate('Description')}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Object.entries(schema.properties as Record<string, SchemaProperty>).map(
        ([name, propSchema]) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell>
              <em>{propSchema.type || 'any'}</em>
            </TableCell>
            <TableCell>{propSchema.description}</TableCell>
          </TableRow>
        ),
      )}
    </TableBody>
  </Table>
);
