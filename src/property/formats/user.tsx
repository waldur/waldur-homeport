import { formatProp, FormattedProperty } from './types';

/** The name fields most API objects carry for a person. */
export interface UserNames {
  full_name?: string | null;
  username?: string | null;
  email?: string | null;
}

const userText = ({ full_name, username, email }: UserNames) =>
  full_name && username
    ? `${full_name} (${username})`
    : full_name || username || email;

/** A person: "Full Name (username)", or whichever name is known. */
export const formatUserValue = (
  value: UserNames | null | undefined,
): FormattedProperty | null => {
  if (!value) {
    return null;
  }
  const text = userText(value);
  if (!text) {
    return null;
  }
  return formatProp(text, text);
};
