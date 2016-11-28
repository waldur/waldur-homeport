export function randomDate() {
  return new Date(+(new Date()) - Math.floor(Math.random() * 10000000000));
}

export function randomChoice(items) {
  const i = Math.round(Math.random() * (items.length - 1));
  return items[i];
}

export function randomInteger(start, end) {
  return start + Math.round(Math.random() * (end - 1));
}

export const randomText = () => randomChoice([
  'Desktop publishing packages and web page editors now use Lorem Ipsum as their default model text',
  'This is issue with the coresponding note',
  'There are many variations of passages of Lorem Ipsum available, but the majority have suffered',
  'Conference on the sales results for the previous year.'
]);

export const randomKey = () => `ISSUE-${randomInteger(10, 100)}`;

export const randomUser = () => randomChoice([
  {
    email: 'victor.mireyev@gmail.com',
    username: 'Alice Lebowski',
    position: 'Administrator',
    organization: 'Ministry of Defense'
  },
  {
    email: 'victor@opennodecloud.com',
    username: 'Walter Lebowski',
    position: 'Manager',
    organization: 'Ministry of State'
  }
]);
