const DEHYDRATED_DEVICE_EVENTS =
  /\/_matrix\/client\/unstable\/org\.matrix\.msc3814\.v1\/dehydrated_device\/[^/]+\/events$/;

/**
 * The fetch the Matrix client uses. matrix-js-sdk reads the events queued for
 * the dehydrated device with GET and a `from` parameter, while Tuwunel serves
 * them only as the earlier POST with `next_batch` in the body. Without them,
 * room keys sent while the user had no client open are lost, and messages
 * from that time cannot be decrypted. This sends that one request as a POST,
 * which Tuwunel keeps serving once it adds the GET.
 */
export const homeserverFetch: typeof fetch = (input, init) => {
  if (
    (init?.method ?? 'GET').toUpperCase() !== 'GET' ||
    input instanceof Request
  ) {
    return fetch(input, init);
  }
  const url = absoluteUrl(input);
  if (!url || !DEHYDRATED_DEVICE_EVENTS.test(url.pathname)) {
    return fetch(input, init);
  }
  const from = url.searchParams.get('from');
  url.searchParams.delete('from');
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  return fetch(url, {
    ...init,
    method: 'POST',
    headers,
    body: JSON.stringify(from ? { next_batch: from } : {}),
  }).then((response) => endOnLastPage(response, from));
};

const absoluteUrl = (input: string | URL): URL | null => {
  try {
    return new URL(input);
  } catch {
    return null;
  }
};

// The SDK reads pages until one has no `next_batch`. Tuwunel ends with an
// empty page whose `next_batch` is null, which the SDK would take for another
// page and start over from the first, for ever. An empty batch, or one that
// does not move past the page just read, would too.
const endOnLastPage = async (
  response: Response,
  from: string | null,
): Promise<Response> => {
  if (!response.ok) return response;
  let page;
  try {
    page = await response.clone().json();
  } catch {
    return response;
  }
  if (
    page?.events?.length &&
    typeof page.next_batch === 'string' &&
    page.next_batch &&
    page.next_batch !== from
  ) {
    return response;
  }
  const { next_batch: _, ...last } = page ?? {};
  return new Response(JSON.stringify(last), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};
