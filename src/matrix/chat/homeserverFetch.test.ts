import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { homeserverFetch } from './homeserverFetch';

const EVENTS =
  'https://chat.example.com/_matrix/client/unstable/org.matrix.msc3814.v1/dehydrated_device/DEHYDRATED/events';

describe('homeserverFetch', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue(new Response('{}'));
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('reads the dehydrated device events with POST', async () => {
    const signal = new AbortController().signal;

    await homeserverFetch(new URL(`${EVENTS}?from=42`), {
      method: 'GET',
      headers: { Authorization: 'Bearer access-1' },
      signal,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(EVENTS);
    expect(init.method).toBe('POST');
    expect(init.body).toBe(JSON.stringify({ next_batch: '42' }));
    expect(init.signal).toBe(signal);
    const headers = new Headers(init.headers);
    expect(headers.get('Authorization')).toBe('Bearer access-1');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('starts from the beginning without a batch', async () => {
    await homeserverFetch(EVENTS, { method: 'GET' });

    expect(fetchMock.mock.calls[0][1].body).toBe('{}');
  });

  it('leaves every other request alone', async () => {
    const init = { method: 'GET' };
    const other = [
      'https://chat.example.com/_matrix/client/v3/sync?since=s1',
      'https://chat.example.com/_matrix/client/unstable/org.matrix.msc3814.v1/dehydrated_device',
    ];

    for (const url of other) await homeserverFetch(url, init);
    await homeserverFetch(EVENTS, { method: 'POST', body: '{}' });

    expect(fetchMock.mock.calls).toEqual([
      [other[0], init],
      [other[1], init],
      [EVENTS, { method: 'POST', body: '{}' }],
    ]);
  });

  it.each([
    ['an empty page', { events: [], next_batch: null }],
    ['a page without a batch', { events: [{ type: 'm.room_key' }] }],
    ['a null batch', { events: [{ type: 'm.room_key' }], next_batch: null }],
    ['an empty batch', { events: [{ type: 'm.room_key' }], next_batch: '' }],
  ])('ends the pages at %s', async (_, page) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify(page)));

    const body = await (
      await homeserverFetch(EVENTS, { method: 'GET' })
    ).json();

    expect(body).not.toHaveProperty('next_batch');
    expect(body.events).toEqual(page.events);
  });

  it('keeps the batch of a page with events', async () => {
    const page = { events: [{ type: 'm.room_key' }], next_batch: '7' };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(page)));

    const body = await (
      await homeserverFetch(EVENTS, { method: 'GET' })
    ).json();

    expect(body).toEqual(page);
  });

  it('ends the pages at a batch that does not move on', async () => {
    const page = { events: [{ type: 'm.room_key' }], next_batch: '42' };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(page)));

    const body = await (
      await homeserverFetch(`${EVENTS}?from=42`, { method: 'GET' })
    ).json();

    expect(body).toEqual({ events: page.events });
  });

  it('passes a body that is not JSON through', async () => {
    fetchMock.mockResolvedValue(new Response('<html>'));

    const response = await homeserverFetch(EVENTS, { method: 'GET' });

    expect(await response.text()).toBe('<html>');
  });

  it('passes errors through', async () => {
    fetchMock.mockResolvedValue(
      new Response('{"errcode":"M_FORBIDDEN"}', { status: 403 }),
    );

    const response = await homeserverFetch(EVENTS, { method: 'GET' });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ errcode: 'M_FORBIDDEN' });
  });
});
