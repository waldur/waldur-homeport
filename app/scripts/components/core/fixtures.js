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

export function randomId() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(10).toUpperCase();
}

export function getRandomDataset(n, start, end) {
  let points = [];
  for (let i = 0; i < n; i++) {
    points.push(randomInteger(start, end));
  }
  return points;
}
