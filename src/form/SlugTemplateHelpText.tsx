import { translate } from '@waldur/i18n';

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
  <div className="form-text text-muted mt-2">
    <p className="mb-2">{translate('Supported placeholders:')}</p>
    <table className="table table-sm table-borderless mb-0">
      <tbody>
        {placeholders.map((p) => (
          <tr key={p.name}>
            <td>
              <code>{`{${p.name}}`}</code>
            </td>
            <td>{p.description}</td>
            <td className="text-muted">
              {translate('e.g.')} <code>{p.example}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
