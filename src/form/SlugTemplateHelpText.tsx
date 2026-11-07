import {
  Code,
  FormText,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'waldur-ui';

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
    <Table density="compact" scrollable={false} className="mb-0">
      <TableBody>
        {placeholders.map((p) => (
          <TableRow key={p.name} divided={false} hoverable={false}>
            <TableCell>
              <Code>{`{${p.name}}`}</Code>
            </TableCell>
            <TableCell>{p.description}</TableCell>
            <TableCell className="text-quaternary">
              {translate('e.g.')} <Code>{p.example}</Code>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </FormText>
);
