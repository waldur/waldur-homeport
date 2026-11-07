import { OfferingTeamPerson } from 'waldur-js-client';

/** A person to hand work to; `NOBODY` is nobody, or the managers. */
export const NOBODY = 'nobody';

export interface TeamPersonOption {
  value: string;
  label: string;
}

/** The team as select options, with the "nobody" choice first. */
export const personOptions = (
  people: OfferingTeamPerson[],
  { nobody }: { nobody: string },
): TeamPersonOption[] => [
  { value: NOBODY, label: nobody },
  ...people.map((person) => ({
    value: person.uuid,
    label: person.role_description
      ? `${person.full_name} (${person.role_description})`
      : person.full_name,
  })),
];

/** The option as the API takes it: a user's uuid, or null for nobody. */
export const personUuid = (option: TeamPersonOption): string | null =>
  option.value === NOBODY ? null : option.value;
