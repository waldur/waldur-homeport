/**
 * Finds hard-coded colours in source files and names the ramp token each one
 * equals or is closest to.
 *
 * A colour literal is a hex value, an `rgb()`/`rgba()`/`hsl()`/`hsla()` call,
 * or a named CSS colour. Only code is searched, never comments:
 *   - TS/JS: string and template literals. A hex or colour function counts
 *     anywhere in the string (`'1px solid #ccc'`, tooltip HTML); a named colour
 *     only when it is the whole string and sits under a colour-like key or JSX
 *     attribute (`fill: 'white'`, `color="red"`), since words such as 'green'
 *     are also variant and enum names.
 *   - CSS/SCSS: declaration values, SCSS variables included.
 *
 * Shared by scripts/color-literals.mjs (the CI ratchet) and meant for the
 * lint rule and codemod that follow, so they all agree on what a colour is.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import postcss from 'postcss';
import postcssScss from 'postcss-scss';
import ts from 'typescript';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../../..');
const RAMPS_FILE = path.resolve(here, '../src/css/primitives/colorRamps.css');

/** Literal count per file that `yarn colors:check` holds the code to. */
export const BASELINE = path.join(
  repoRoot,
  'scripts/color-literals.baseline.json',
);

// Files where a literal colour is the point, not a shortcut. Each entry says
// why; a whole file is skipped, so keep entries narrow.
const ALLOWED = {
  // Where the colours are defined.
  'packages/design-tokens/': 'design token sources',
  'packages/boot-splash/':
    'paints before any stylesheet loads, so it cannot read the tokens',
  'src/administration/settings/ConfigurationEditDialog.tsx':
    'brand colour presets offered in the colour picker',
  'src/openstack/openstack-tenant/TenantTopology/nodePalette.ts':
    'a fixed dark palette, one muted hue per node type, drawn alike in both themes',
  // Login-page artwork: each layout and its preview is a fixed design over
  // an image or gradient, chosen by an admin, not part of the app's theme.
  'src/auth/layouts/': 'login layout artwork',
  'src/auth/LayoutPreview.tsx': 'thumbnails of the login layout artwork',
  'src/auth/HeroColumn.css': 'login hero overlay on an image',
  'src/auth/storyFixtures.tsx': 'story fixture: the default brand colour',
  // Colours that are not painted as such.
  'packages/ui/src/Dialog/RadialBackground.tsx': 'SVG mask stops (alpha)',
  'src/navigation/header/search/NoResult.scss': 'gradient mask (alpha)',
  // Rendered outside the app's stylesheet, where no token resolves.
  'src/core/SVGImagePlaceholder.tsx': 'SVG data-URI image',
  'src/proposals/proposal/proposalPdf.ts': 'PDF document',
  'src/customer/project-digest/ProjectDigestPreview.tsx': 'email preview',
  'src/marketplace/resources/usage/UsageExportDropdown.tsx':
    'a fixed light chart rendered off-screen for export',
  'src/map/SetLocationDialog.scss': "text on Leaflet's own white panel",
  // Fixed by someone else, or compiled into the defaults.
  'src/core/OrcidLogo.tsx': 'ORCID brand colours',
  'src/SettingsDescription.ts': 'generated: the default brand colour',
  'src/styles/bootstrap/_variables.scss': "Bootstrap's Sass variable source",
};

const SKIPPED = [
  /\.(?:test|spec)\.[jt]sx?$/,
  /\.stories\.[jt]sx?$/,
  /^src\/test\//,
  /(?:^|\/)__mocks__\//,
  /\.d\.ts$/,
];

/** Whether a repo-relative path is a source file the colour checks cover. */
export function isCovered(file) {
  return (
    /\.(?:[cm]?[jt]sx?|s?css)$/.test(file) &&
    !SKIPPED.some((re) => re.test(file)) &&
    !Object.keys(ALLOWED).some((prefix) => file.startsWith(prefix))
  );
}

/** A file's path relative to the repository, with forward slashes. */
export function repoPath(file) {
  return path.relative(repoRoot, path.resolve(file)).split(path.sep).join('/');
}

const HEX = /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/gi;
const COLOR_FUNCTION = /(?<![\w-])(?:rgba?|hsla?)\(/gi;

// CSS named colours, minus the keywords that are not a fixed colour
// (transparent, currentColor, inherit, …).
const NAMED_COLORS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black
  blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate
  coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod
  darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange
  darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray
  darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey
  dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold
  goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory
  khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral
  lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink
  lightsalmon lightseagreen lightskyblue lightslategray lightslategrey
  lightsteelblue lightyellow lime limegreen linen magenta maroon
  mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen
  mediumslateblue mediumspringgreen mediumturquoise mediumvioletred
  midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive
  olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise
  palevioletred papayawhip peachpuff peru pink plum powderblue purple
  rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen
  seashell sienna silver skyblue slateblue slategray slategrey snow springgreen
  steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke
  yellow yellowgreen`.split(/\s+/),
);

// Keys and JSX attributes whose string value is a colour.
const COLOR_KEY =
  /^(?:colou?rs?|fill|stroke|stopColor|stop-color|floodColor|lightingColor|background|backgroundColor|borderColor|border(?:Top|Right|Bottom|Left)Color|outlineColor|textDecorationColor|caretColor|shadowColor|[a-z]+Colou?r)$/i;

/** Maps each ramp hex in colorRamps.css to its `ramp-step` names. */
export function loadRampIndex(file = RAMPS_FILE) {
  const css = readFileSync(file, 'utf8');
  const index = new Map();
  for (const [, name, hex] of css.matchAll(
    /--color-([a-z-]+-\d+):\s*(#[0-9a-f]{6})\b/gi,
  )) {
    const key = hex.toLowerCase();
    index.set(key, [...(index.get(key) ?? []), name]);
  }
  return index;
}

/** Parses `#rgb`, `#rgba`, `#rrggbb` or `#rrggbbaa` into [r, g, b]. */
function hexToRgb(hex) {
  let h = hex.slice(1).toLowerCase();
  if (h.length <= 4) h = [...h].map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/**
 * The ramp token a hex value equals (`exact: true`) or is closest to by RGB
 * distance. Returns null for anything that is not a hex value.
 */
export function nearestToken(value, rampIndex) {
  if (!/^#[0-9a-f]+$/i.test(value)) return null;
  const rgb = hexToRgb(value);
  const six = '#' + rgb.map((n) => n.toString(16).padStart(2, '0')).join('');
  if (rampIndex.has(six)) {
    return { token: rampIndex.get(six)[0], exact: true };
  }
  let best = null;
  for (const [hex, names] of rampIndex) {
    // gray-dark is for dark surfaces; a literal in code is almost always
    // written for the light theme, so the nearest step is sought elsewhere.
    if (names.every((name) => name.startsWith('gray-dark-'))) continue;
    const other = hexToRgb(hex);
    const distance = Math.hypot(...rgb.map((n, i) => n - other[i]));
    if (!best || distance < best.distance) {
      best = { token: names[0], exact: false, distance };
    }
  }
  return best && { token: best.token, exact: false };
}

/** Hex and colour-function matches inside one string of code. */
function scanString(text, offset, push) {
  for (const m of text.matchAll(HEX)) {
    // `#455` in prose is an issue number; a short grey such as `#333` comes
    // first in its string or after `:`, `,`, a function's `(`, a length or a
    // border style.
    if (
      /^#\d{3,4}$/.test(m[0]) &&
      !/(?:^|[:,]|\w\(|\d(?:px|r?em|%)?|\b(?:solid|dashed|dotted|double))\s*$/.test(
        text.slice(0, m.index),
      )
    ) {
      continue;
    }
    push('hex', m[0], offset + m.index);
  }
  for (const m of text.matchAll(COLOR_FUNCTION)) {
    const end = text.indexOf(')', m.index);
    // A call built from a token or a variable (`rgba(var(--brand-rgb), .1)`,
    // `rgba($black, .1)`, `` `rgba(${rgb}, 0.2)` ``) is not a literal: the
    // colour it reads is counted where it is defined, if anywhere. Nor is a
    // bare name in prose (`rgb()`).
    if (end === -1) continue;
    const value = text.slice(m.index, end + 1);
    if (/var\(|\$|\(\s*\)/.test(value)) continue;
    push('function', value, offset + m.index);
  }
}

/** The key or JSX attribute name a string literal is the value of. */
function ownerName(node) {
  const parent = node.parent;
  if (ts.isPropertyAssignment(parent) && parent.initializer === node) {
    return parent.name.getText();
  }
  if (ts.isJsxAttribute(parent)) return parent.name.getText();
  if (
    ts.isJsxExpression(parent) &&
    parent.parent &&
    ts.isJsxAttribute(parent.parent)
  ) {
    return parent.parent.name.getText();
  }
  return null;
}

function scanScript(source, fileName, push) {
  const kind = /\.tsx$|\.jsx$/.test(fileName)
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    kind,
  );
  const visit = (node) => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const start = node.getStart(sf) + 1;
      scanString(node.text, start, push);
      if (ts.isStringLiteral(node) && NAMED_COLORS.has(node.text)) {
        const owner = ownerName(node);
        if (owner && COLOR_KEY.test(owner.replace(/['"]/g, ''))) {
          push('named', node.text, start);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

function scanStyles(source, fileName, push) {
  const root = (fileName.endsWith('.scss') ? postcssScss : postcss).parse(
    source,
  );
  root.walkDecls((decl) => {
    const valueStart =
      decl.source.start.offset +
      decl.prop.length +
      (decl.raws.between?.length ?? 1);
    scanString(decl.value, valueStart, push);
    // Blank out var(), url() and quoted strings, keeping offsets, so only
    // bare words are left to match against the named colours.
    const words = decl.value.replace(
      /(?:var|url)\([^)]*\)|(['"]).*?\1/gi,
      (m) => ' '.repeat(m.length),
    );
    for (const m of words.matchAll(/(?<![\w$#.@-])[a-z]+(?![\w-])/gi)) {
      if (NAMED_COLORS.has(m[0].toLowerCase())) {
        push('named', m[0], valueStart + m.index);
      }
    }
  });
}

/** Offset → 1-based line and column. */
function locator(source) {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') starts.push(i + 1);
  }
  return (offset) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (starts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, column: offset - starts[lo] + 1 };
  };
}

/**
 * Lists the colour literals in one file's source, ordered by position:
 * `{ kind: 'hex' | 'function' | 'named', value, line, column, token }`, where
 * `token` is the nearest ramp token for a hex value (see `nearestToken`).
 */
export function findColorLiterals(source, fileName, rampIndex) {
  const found = [];
  const push = (kind, value, offset) => found.push({ kind, value, offset });
  if (/\.(?:s?css)$/.test(fileName)) {
    scanStyles(source, fileName, push);
  } else {
    scanScript(source, fileName, push);
  }
  const locate = locator(source);
  return found
    .sort((a, b) => a.offset - b.offset)
    .map(({ kind, value, offset }) => ({
      kind,
      value,
      ...locate(offset),
      token: rampIndex ? nearestToken(value, rampIndex) : null,
    }));
}
