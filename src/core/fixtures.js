export function randomDate() {
  return new Date(+new Date() - Math.floor(Math.random() * 10000000000));
}

export function randomChoice(items) {
  const i = Math.round(Math.random() * (items.length - 1));
  return items[i];
}

function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

export function randomChoiceList(items) {
  const len = randomInteger(1, items.length + 1);
  const choices = shuffle([...items]);
  return choices.slice(0, len);
}

export function randomInteger(start, end) {
  return start + Math.round(Math.random() * (end - 1));
}

export function randomId() {
  return Math.floor((1 + Math.random()) * 0x100000)
    .toString(10)
    .toUpperCase();
}

export function getRandomDataset(n, start, end) {
  let points = [];
  for (let i = 0; i < n; i++) {
    points.push(randomInteger(start, end));
  }
  return points;
}
