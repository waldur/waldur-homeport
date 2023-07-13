import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

export const VariablesList = ({ offering }) => (
  <>
    <p>
      <strong>{translate('Environment variables')}</strong>
    </p>
    <ul>
      {offering.secret_options.environ?.map((variable) => (
        <li key={variable.name}>
          <Tip
            id={variable.name}
            label={translate('Value: {value}', {
              value: variable.value,
            })}
          >
            {variable.name}
          </Tip>
        </li>
      ))}
    </ul>

    <p>
      <strong>{translate('User input variables')}</strong>
    </p>
    <ul>
      {offering.options.order?.map((name) => (
        <li key={name}>
          <Tip
            id={name}
            label={translate('Type: {type}', {
              type: offering.options.options[name].type,
            })}
          >
            {name}
          </Tip>
        </li>
      ))}
    </ul>
  </>
);
