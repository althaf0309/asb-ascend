import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchBlog, isNotFoundError } from '@/lib/api';

const json = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('public record fetching', () => {
  it('retries a rate-limited request instead of treating the page as missing', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(429))
      .mockResolvedValueOnce(json(503))
      .mockResolvedValueOnce(json(200, { slug: 'python-vs-java' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = fetchBlog('python-vs-java');
    await vi.runAllTimersAsync();

    await expect(result).resolves.toEqual({ slug: 'python-vs-java' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('reports only a 404 as not found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(404)));
    const missing = await fetchBlog('gone').catch((error) => error);
    expect(isNotFoundError(missing)).toBe(true);
  });

  it('does not report a persistent outage as not found', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(429)));

    const result = fetchBlog('python-vs-java').catch((error) => error);
    await vi.runAllTimersAsync();

    const error = await result;
    expect(error).toBeInstanceOf(Error);
    expect(isNotFoundError(error)).toBe(false);
  });
});
