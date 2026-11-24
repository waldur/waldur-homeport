import { describe, it, expect } from 'vitest';

import {
  transformPhosphorDef,
  scanPhosphorWeights,
  scanSourceContent,
  ALL_WEIGHTS,
} from './vite-plugin-phosphor-weights';

const SAMPLE_DEF_CODE = `import * as a from "react";
const l = /* @__PURE__ */ new Map([
  [
    "bold",
    /* @__PURE__ */ a.createElement("path", { d: "bold-path" })
  ],
  [
    "duotone",
    /* @__PURE__ */ a.createElement("path", { d: "duotone-path" })
  ],
  [
    "fill",
    /* @__PURE__ */ a.createElement("path", { d: "fill-path" })
  ],
  [
    "light",
    /* @__PURE__ */ a.createElement("path", { d: "light-path" })
  ],
  [
    "regular",
    /* @__PURE__ */ a.createElement("path", { d: "regular-path" })
  ],
  [
    "thin",
    /* @__PURE__ */ a.createElement("path", { d: "thin-path" })
  ]
]);
export {
  l as default
};
`;

describe('transformPhosphorDef', () => {
  it('strips unused weights and retains only specified weights', () => {
    const transformed = transformPhosphorDef(
      SAMPLE_DEF_CODE,
      new Set(['bold']),
    );
    expect(transformed).not.toBeNull();
    expect(transformed!.code).toContain('["bold",');
    expect(transformed!.code).not.toContain('["duotone",');
    expect(transformed!.code).not.toContain('["fill",');
    expect(transformed!.code).not.toContain('["light",');
    expect(transformed!.code).not.toContain('["regular",');
    expect(transformed!.code).not.toContain('["thin",');
    expect(transformed!.code).toContain('const _get_l = l.get.bind(l);');
    expect(transformed!.map).toBeDefined();
    expect(transformed!.map.mappings).toBeDefined();
  });

  it('keeps multiple detected weights when used', () => {
    const transformed = transformPhosphorDef(
      SAMPLE_DEF_CODE,
      new Set(['bold', 'fill']),
    );
    expect(transformed).not.toBeNull();
    expect(transformed!.code).toContain('["bold",');
    expect(transformed!.code).toContain('["fill",');
    expect(transformed!.code).not.toContain('["duotone",');
    expect(transformed!.code).not.toContain('["thin",');
  });

  it('keeps the last Map entry (thin) when it is requested', () => {
    const transformed = transformPhosphorDef(
      SAMPLE_DEF_CODE,
      new Set(['thin']),
    );
    expect(transformed).not.toBeNull();
    expect(transformed!.code).toContain('["thin",');
    expect(transformed!.code).toContain('thin-path');
    expect(transformed!.code).not.toContain('["bold",');
  });

  it('keeps thin alongside other weights', () => {
    const transformed = transformPhosphorDef(
      SAMPLE_DEF_CODE,
      new Set(['bold', 'thin']),
    );
    expect(transformed).not.toBeNull();
    expect(transformed!.code).toContain('["bold",');
    expect(transformed!.code).toContain('["thin",');
    expect(transformed!.code).not.toContain('["regular",');
  });

  it('returns null when targetWeights is empty or unspecified (safe default, keeps all)', () => {
    const transformed = transformPhosphorDef(SAMPLE_DEF_CODE);
    expect(transformed).toBeNull();
  });

  it('returns null if all weights are requested (no transform needed)', () => {
    const allWeights = new Set(ALL_WEIGHTS);
    const transformed = transformPhosphorDef(SAMPLE_DEF_CODE, allWeights);
    expect(transformed).toBeNull();
  });

  it('attaches fallback that returns primary weight when missing weight is queried', () => {
    const transformed = transformPhosphorDef(
      SAMPLE_DEF_CODE,
      new Set(['bold']),
    );
    expect(transformed).not.toBeNull();

    // Strip import and export lines to test the runtime Map in an evaluated function
    const executableCode = transformed!.code
      .replace(/import\s+[\s\S]*?;\n/, '')
      .replace(/export\s*\{[\s\S]*?\};/, '');

    const evalCode = `
      const a = { createElement: (tag, props) => ({ tag, props }) };
      ${executableCode}
      return l;
    `;
    const map = new Function(evalCode)();

    // Querying existing weight returns it
    const boldEl = map.get('bold');
    expect(boldEl).toEqual({ tag: 'path', props: { d: 'bold-path' } });

    // Querying stripped weight falls back to bold
    const missingEl = map.get('thin');
    expect(missingEl).toEqual(boldEl);
  });
});

describe('scanPhosphorWeights', () => {
  it('scans codebase directories without throwing', () => {
    const weightsMap = scanPhosphorWeights(process.cwd(), ['packages/ui']);
    expect(weightsMap instanceof Map).toBe(true);
    expect(weightsMap.unresolvedIcons instanceof Set).toBe(true);
  });
});

describe('scanSourceContent fixtures', () => {
  it('handles ternary weight={pinned ? "fill" : "bold"} and retains both weights', () => {
    const code = `
      import { PushPinIcon } from '@phosphor-icons/react';
      export const PinButton = ({ pinned }) => (
        <PushPinIcon size={16} weight={pinned ? 'fill' : 'bold'} />
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('PushPin')).toEqual(new Set(['bold', 'fill']));
    expect(unresolved.has('PushPin')).toBe(false);
  });

  it('handles dynamic weight={variable} by keeping all six weights and marking unresolved', () => {
    const code = `
      import { UserIcon } from '@phosphor-icons/react';
      export const Profile = ({ dynamicWeight }) => (
        <UserIcon weight={dynamicWeight} />
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('User')).toEqual(new Set(ALL_WEIGHTS));
    expect(unresolved.has('User')).toBe(true);
  });

  it('handles indirect rendering via const C = a ? A : B; <C weight="fill"> safely', () => {
    const code = `
      import { StarIcon, StarHalfIcon } from '@phosphor-icons/react';
      export const RateStars = ({ isHalf }) => {
        const StarComponent = isHalf ? StarHalfIcon : StarIcon;
        return <StarComponent weight="fill" />;
      };
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    // Star and StarHalf were not directly rendered as <StarIcon> or <StarHalfIcon>
    expect(weightsMap.get('Star')).toEqual(new Set(ALL_WEIGHTS));
    expect(weightsMap.get('StarHalf')).toEqual(new Set(ALL_WEIGHTS));
    expect(unresolved.has('Star')).toBe(true);
    expect(unresolved.has('StarHalf')).toBe(true);
  });

  it('handles property-based indirect rendering <spec.Icon weight="fill"> safely', () => {
    const code = `
      import { ClockIcon, XCircleIcon } from '@phosphor-icons/react';
      const STATE_SPECS = {
        pending: { Icon: ClockIcon },
        error: { Icon: XCircleIcon },
      };
      export const Indicator = ({ state }) => {
        const spec = STATE_SPECS[state];
        return <spec.Icon weight="fill" />;
      };
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Clock')).toEqual(new Set(ALL_WEIGHTS));
    expect(weightsMap.get('XCircle')).toEqual(new Set(ALL_WEIGHTS));
    expect(unresolved.has('Clock')).toBe(true);
    expect(unresolved.has('XCircle')).toBe(true);
  });

  it('handles "as" aliases and normalizes icon names', () => {
    const code = `
      import { Gear as CustomGear, Trash as CustomTrashIcon } from '@phosphor-icons/react';
      export const Settings = () => (
        <div>
          <CustomGear weight="bold" />
          <CustomTrashIcon weight="fill" />
        </div>
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Gear')).toEqual(new Set(['bold']));
    expect(weightsMap.get('Trash')).toEqual(new Set(['fill']));
    expect(unresolved.size).toBe(0);
  });

  it('handles multi-line attributes correctly', () => {
    const code = `
      import { HouseIcon } from '@phosphor-icons/react';
      export const Home = () => (
        <HouseIcon
          size={24}
          color="#333"
          weight="bold"
          className="home-icon"
        />
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('House')).toEqual(new Set(['bold']));
  });

  it('handles arrow function (=>) and comparison operators inside JSX attributes', () => {
    const code = `
      import { ArrowRightIcon } from '@phosphor-icons/react';
      export const NextButton = ({ items }) => (
        <ArrowRightIcon
          onClick={() => {
            if (items.length > 0) {
              console.log('next > arrow');
            }
          }}
          weight="bold"
        />
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('ArrowRight')).toEqual(new Set(['bold']));
    expect(unresolved.has('ArrowRight')).toBe(false);
  });

  it('ignores inline "type" specifiers and does not record a fake icon named "type"', () => {
    const code = `
      import { type IconWeight, GearIcon, type IconProps } from '@phosphor-icons/react';
      export const Settings = () => <GearIcon weight="bold" />;
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.has('type')).toBe(false);
    expect(weightsMap.has('IconWeight')).toBe(false);
    expect(weightsMap.has('IconProps')).toBe(false);
    expect(weightsMap.get('Gear')).toEqual(new Set(['bold']));
  });

  it('ignores top-level "import type" declarations completely', () => {
    const code = `
      import type { GearIcon, IconWeight } from '@phosphor-icons/react';
      export type MyIcon = GearIcon;
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.size).toBe(0);
  });

  it('defaults omitted weight to regular', () => {
    const code = `
      import { CheckIcon } from '@phosphor-icons/react';
      export const CheckMark = () => <CheckIcon size={16} />;
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Check')).toEqual(new Set(['regular']));
  });

  it('keeps all weights when the icon is rendered directly and also passed as a prop', () => {
    const code = `
      import { IdentificationBadgeIcon } from '@phosphor-icons/react';
      export const Staff = ({ compact }) =>
        compact ? (
          <IdentificationBadgeIcon weight="bold" />
        ) : (
          <HelpIcon icon={IdentificationBadgeIcon} weight="fill" />
        );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('IdentificationBadge')).toEqual(new Set(ALL_WEIGHTS));
    expect(unresolved.has('IdentificationBadge')).toBe(true);
  });

  it('does not treat a closing tag as an indirect use', () => {
    const code = `
      import { GearIcon } from '@phosphor-icons/react';
      export const Settings = () => (
        <GearIcon weight="bold">
          <title>Settings</title>
        </GearIcon>
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Gear')).toEqual(new Set(['bold']));
    expect(unresolved.has('Gear')).toBe(false);
  });

  it('keeps all weights when props are spread onto the icon', () => {
    const code = `
      import { GearIcon } from '@phosphor-icons/react';
      export const Settings = (props) => <GearIcon size={16} {...props} />;
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Gear')).toEqual(new Set(ALL_WEIGHTS));
    expect(unresolved.has('Gear')).toBe(true);
  });

  it('does not treat an object spread inside an attribute as a props spread', () => {
    const code = `
      import { GearIcon } from '@phosphor-icons/react';
      export const Settings = ({ s }) => (
        <GearIcon style={{ ...s, opacity: 1 }} weight="bold" />
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.get('Gear')).toEqual(new Set(['bold']));
  });

  it('ignores non-icon exports such as IconContext and IconProps', () => {
    const code = `
      import { IconContext, IconProps, GearIcon } from '@phosphor-icons/react';
      export const Widget = () => (
        <IconContext.Provider value={{ color: 'red' }}>
          <GearIcon weight="bold" />
        </IconContext.Provider>
      );
    `;
    const weightsMap = new Map<string, Set<string>>();
    const unresolved = new Set<string>();
    scanSourceContent(code, weightsMap, unresolved);

    expect(weightsMap.has('IconContext')).toBe(false);
    expect(weightsMap.has('IconProps')).toBe(false);
    expect(weightsMap.has('Icon')).toBe(false);
    expect(weightsMap.get('Gear')).toEqual(new Set(['bold']));
  });
});
