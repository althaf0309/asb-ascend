import { afterEach, describe, expect, it, vi } from 'vitest';
import { submitInquiry } from '@/lib/api';

afterEach(() => vi.unstubAllGlobals());

describe('public form email delivery', () => {
  it('calls Web3Forms in the browser only after backend acceptance', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: true,
        id: 'accepted-1',
        notification: {
          endpoint: 'https://api.web3forms.com/submit',
          payload: { access_key: 'public-test-key', subject: 'New inquiry' },
        },
      }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    vi.stubGlobal('fetch', fetchMock);

    await submitInquiry({ name: 'Valid Student', phone: '9876543210' });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.web3forms.com/submit');
  });

  it('does not contact Web3Forms when the backend silently rejects spam', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await submitInquiry({ name: 'Bot Payload', phone: '9876543210' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
