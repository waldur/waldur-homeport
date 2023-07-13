import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { EnvironmentVariablePanel } from './EnvironmentVariablePanel';

export const EnvironmentVariablesList: FunctionComponent<any> = (props) => (
  <table className="table table-sm table-hover">
    <tbody>
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
        <tr>
          <td className="text-center text-muted">
            {translate('No variable defined')}
          </td>
        </tr>
      )}
    </tbody>
  </table>
);
