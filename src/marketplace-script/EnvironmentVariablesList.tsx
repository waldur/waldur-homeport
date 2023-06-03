import { FunctionComponent } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { EnvironmentVariablePanel } from './EnvironmentVariablePanel';
import { ScriptEditorAddButton } from './ScriptEditorAddButton';

export const EnvironmentVariablesList: FunctionComponent<any> = (props) => (
  <Form.Group>
    <div className="d-flex justify-content-between align-items-center border-bottom border-top p-2">
      <strong>{translate('Environment variables')}</strong>
      <ScriptEditorAddButton onClick={() => props.fields.push({})} />
    </div>
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
  </Form.Group>
);
