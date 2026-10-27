import { FormText } from 'waldur-ui';

import { translate } from '@/i18n';

interface Placeholder {
  name: string;
  description: string;
  example: string;
}

interface SlugTemplateHelpTextProps {
  placeholders: Placeholder[];
}

export const SlugTemplateHelpText = ({
  placeholders,
}: SlugTemplateHelpTextProps) => (
  <FormText as="div" variant="muted" className="mt-1.5">
    <p className="mb-1.5">{translate('Supported placeholders:')}</p>
    <table className="table table-sm table-borderless mb-0">
      <tbody>
        {placeholders.map((p) => (
          <tr key={p.name}>
            <td>
              <code>{`{${p.name}}`}</code>
            </td>
            <td>{p.description}</td>
            <td className="text-quaternary">
              {translate('e.g.')} <code>{p.example}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </FormText>
);
