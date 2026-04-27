import { translate } from '@/i18n';

import { SchemaProperty } from './types';

export const VariablesPane = ({ schema }) => (
  <table className="table table-bordered table-striped table-sm">
    <thead>
      <tr>
        <th>{translate('Variable')}</th>
        <th>{translate('Type')}</th>
        <th>{translate('Description')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(schema.properties as Record<string, SchemaProperty>).map(
        ([name, propSchema]) => (
          <tr key={name}>
            <td>{name}</td>
            <td>
              <em>{propSchema.type || 'any'}</em>
            </td>
            <td>{propSchema.description}</td>
          </tr>
        ),
      )}
    </tbody>
  </table>
);
