import type { Meta, StoryObj } from '@storybook/react-vite';

import elevationCss from './css/semantic/elevation.css?raw';
import {
  parseTokenFile,
  type Token,
  type TokenFile,
} from './stories/tokenSource';
import { Prose, TokenPage, TokenTable, Mono } from './stories/TokenTable';

const meta: Meta = {
  title: 'Foundations/Elevation',
  parameters: {
    docs: {
      description: {
        component:
          'Shadow tokens that lift a surface off the page: the semantic elevation layer (semantic/elevation.css) and the component shadows that compose with it. Corner radius is on Foundations/Layout.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const components = import.meta.glob<string>('./css/components/*.css', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const elevation = parseTokenFile(elevationCss);
/** Every shadow a component file declares, with the file it comes from. */
const componentShadows: (Token & { file: string })[] = Object.entries(
  components,
).flatMap(([path, css]) =>
  parseTokenFile(css)
    .tokens.filter((t) => /shadow/.test(t.name))
    .map((t) => ({ ...t, file: path.replace('./css/', '') })),
);
const shadowFile: TokenFile = {
  doc: '',
  blocks: ['light', 'dark'],
  tokens: [
    ...elevation.tokens.filter((t) => /shadow/.test(t.name)),
    ...componentShadows,
  ],
};

function ShadowCard({ token }: { token: Token & { file?: string } }) {
  return (
    <div
      className="flex h-32 flex-col items-center justify-center rounded-md bg-[var(--card-bg)] p-4 text-center"
      style={{ boxShadow: `var(${token.name})` }}
    >
      <Mono className="text-xs font-semibold text-primary">{token.name}</Mono>
      <span className="mt-1 text-[11px] text-quinary">
        {token.file ?? 'semantic/elevation.css'}
      </span>
      {token.note && (
        <span className="mt-2 line-clamp-3 text-[11px] text-quaternary">
          <Prose text={token.note} />
        </span>
      )}
    </div>
  );
}

/**
 * Each shadow on a card, as the page renders it in the current theme, then
 * its light and dark source values.
 */
export const Shadows: Story = {
  render: () => (
    <TokenPage title="Elevation" intro={elevation.doc}>
      <div className="mb-8 grid grid-cols-1 gap-8 p-2 sm:grid-cols-2 lg:grid-cols-4">
        {shadowFile.tokens.map((t) => (
          <ShadowCard key={t.name} token={t} />
        ))}
      </div>
      <TokenTable file={shadowFile} />
    </TokenPage>
  ),
};
