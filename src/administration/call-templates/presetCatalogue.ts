import { CallTemplatePreset, CallTemplateProgramme } from 'waldur-js-client';

export interface PresetProgrammeGroup {
  programme: CallTemplateProgramme;
  presets: CallTemplatePreset[];
}

export interface PresetCatalogue {
  /** Patterns any organisation can adopt, in one flat list. */
  generic: CallTemplatePreset[];
  /** The processes of each programme, programmes by name. */
  programmes: PresetProgrammeGroup[];
  /** Presets saying neither: no block, or a process of no programme. */
  other: CallTemplatePreset[];
}

/** Whether ``preset`` matches every word of ``query`` in its name, process,
 * organisation, programme or tags. */
const presetMatches = (preset: CallTemplatePreset, query: string) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [
    preset.name,
    preset.preset?.process,
    preset.preset?.organization,
    preset.preset?.programme?.name,
    ...(preset.preset?.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/** The presets matching ``query``: generic patterns, then the programmes
 * with their processes, then the rest. */
export const groupPresets = (
  presets: CallTemplatePreset[],
  query = '',
): PresetCatalogue => {
  const catalogue: PresetCatalogue = { generic: [], programmes: [], other: [] };
  const programmes = new Map<string, PresetProgrammeGroup>();
  for (const preset of presets) {
    if (!presetMatches(preset, query)) continue;
    const programme = preset.preset?.programme;
    if (programme) {
      if (!programmes.has(programme.key)) {
        programmes.set(programme.key, { programme, presets: [] });
      }
      programmes.get(programme.key).presets.push(preset);
    } else if (preset.preset?.category === 'generic') {
      catalogue.generic.push(preset);
    } else {
      catalogue.other.push(preset);
    }
  }
  catalogue.programmes = [...programmes.values()].sort((a, b) =>
    a.programme.name.localeCompare(b.programme.name),
  );
  return catalogue;
};

export const isEmptyCatalogue = (catalogue: PresetCatalogue) =>
  !catalogue.generic.length &&
  !catalogue.programmes.length &&
  !catalogue.other.length;
