import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Clock, Eye, FileDown, MapPin, MessageCircle, MousePointerClick, Send, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminNav from '@/components/admin/AdminNav';
import { useAdminAuth } from '@/components/admin/useAdminAuth';
import { fetchAdminAnalytics, type AnalyticsClick, type AnalyticsReport } from '@/lib/api';
import { escapeCsvCell } from '@/lib/csv';

/** One headline number. Uses theme tokens so it stays legible in both themes. */
const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) => (
  <div className="rounded-xl border border-border bg-card p-5">
    <Icon className="text-primary h-5 w-5" aria-hidden />
    <div className="text-3xl font-bold mt-3 text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

/** A titled panel; every section on the page shares this frame. */
const Panel = ({
  title,
  note,
  action,
  className = '',
  children,
}: {
  title: string;
  note?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) => (
  <section className={`rounded-xl border border-border bg-card p-5 ${className}`}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-bold font-heading text-foreground">{title}</h2>
      {action}
    </div>
    {note && <p className="text-xs text-muted-foreground mt-1">{note}</p>}
    {children}
  </section>
);

/** Rows of "label … count", the shape three of the panels need. */
const CountList = ({ rows, className = '' }: { rows: [string, number][]; className?: string }) => {
  if (!rows?.length) {
    return <p className="text-sm text-muted-foreground mt-4">Nothing recorded yet.</p>;
  }
  return (
    <div className={className || 'space-y-3 mt-4'}>
      {rows.map(([label, count]) => (
        <div key={label} className="flex justify-between gap-4 text-sm">
          <span className="truncate text-muted-foreground">{label}</span>
          <strong className="text-foreground">{count}</strong>
        </div>
      ))}
    </div>
  );
};


/** Human names for the click channels the tracker records. */
const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp', phone: 'Phone call', email: 'Email', maps: 'Google Maps', social: 'Social media',
  form: 'Form button', navigation: 'Page link', external: 'External link', button: 'Other button', other: 'Other',
};
const channelName = (channel: string) => CHANNEL_LABELS[channel] || channel;
const CONTACT = new Set(['whatsapp', 'phone', 'email']);

const istTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const downloadCsv = (name: string, rows: unknown[][]) => {
  const csv = rows.map((r) => r.map(escapeCsvCell).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

/** A plain table with a header row and an empty state. */
const Table = ({ head, rows, empty = 'Nothing recorded yet.' }: { head: string[]; rows: React.ReactNode[][]; empty?: string }) => (
  <div className="overflow-x-auto mt-4">
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-muted-foreground border-b border-border">
          {head.map((h) => <th key={h} className="p-2 font-medium whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={head.length} className="p-4 text-center text-muted-foreground">{empty}</td></tr>
        ) : rows.map((cells, i) => (
          <tr key={i} className="border-t border-border text-foreground align-top">
            {cells.map((cell, j) => <td key={j} className="p-2">{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ChannelBadge = ({ channel }: { channel: string }) => (
  <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${CONTACT.has(channel) ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>
    {channelName(channel)}
  </span>
);

const AdminAnalytics = () => {
  const { token, loggingIn, login, logout, signedIn } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const [from, setFrom] = useState(() => iso(new Date(Date.now() - 29 * 86400000)));
  const [to, setTo] = useState(() => iso(new Date()));
  const [channelFilter, setChannelFilter] = useState('contact');

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    fetchAdminAnalytics(token, from, to)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, [token, from, to]);

  const preset = (days: number) => {
    setTo(iso(new Date()));
    setFrom(iso(new Date(Date.now() - (days - 1) * 86400000)));
  };

  useEffect(() => {
    if (signedIn) load();
  }, [signedIn, load]);

  if (!signedIn) {
    return (
      <main className="min-h-screen gradient-bg flex items-center justify-center px-4 pt-24">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await login(username, password);
          }}
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <h1 className="text-2xl font-bold font-heading text-foreground">Admin Login</h1>
          <label htmlFor="analytics-user" className="sr-only">Username</label>
          <input
            id="analytics-user"
            className="w-full border border-input rounded p-3 mt-5 bg-background text-foreground"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="analytics-pass" className="sr-only">Password</label>
          <input
            id="analytics-pass"
            className="w-full border border-input rounded p-3 mt-3 bg-background text-foreground"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className="w-full mt-4" disabled={loggingIn}>Sign in</Button>
        </form>
      </main>
    );
  }

  const summary = data?.summary;
  const cards: [string, string, typeof Eye][] = summary
    ? [
        ['Visitors', String(summary.visitors ?? summary.sessions), Users],
        ['Page views', String(summary.pageViews), Eye],
        ['Contact clicks (WhatsApp, call, email)', `${summary.contactClicks ?? 0} by ${summary.contactVisitors ?? 0} people`, MessageCircle],
        ['All clicks', `${summary.clicks ?? 0} by ${summary.uniqueClickers ?? 0} people`, MousePointerClick],
        ['Form submissions', String(summary.formSubmissions), Send],
        ['Average time / scroll', `${summary.averageDurationSeconds}s · ${summary.averageScrollDepth}%`, Clock],
      ]
    : [];

  const filteredClicks: AnalyticsClick[] = (data?.clickLog || []).filter((c) =>
    channelFilter === 'all' ? true : channelFilter === 'contact' ? CONTACT.has(c.channel) : c.channel === channelFilter,
  );

  const exportClicks = () =>
    downloadCsv('asb-clicks', [
      ['Time (IST)', 'Page', 'Clicked', 'App / type', 'Link', 'Where on page', 'Location', 'Device', 'Visitor', 'Click no.', 'IP'],
      ...filteredClicks.map((c) => [istTime(c.createdAt), c.path, c.label, channelName(c.channel), c.target, c.placement, c.location, [c.device, c.os, c.browser].filter(Boolean).join(' / '), c.visitor, c.repeat, c.ip]),
    ]);

  const exportEvents = () =>
    downloadCsv('asb-analytics', [
      ['Event', 'Time (IST)', 'Page', 'Keyword', 'Source', 'Seconds', 'Scroll', 'Location', 'Device', 'IP', 'Email'],
      ...(data?.recentEvents || []).map((e) => [
        e.eventType, istTime(String(e.createdAt)), e.path, e.searchTerm || e.landingKeyword, e.source, e.durationSeconds, e.scrollDepth,
        [e.city, e.region, e.country].filter(Boolean).join(', '), e.device, e.ip, e.email,
      ]),
    ]);

  return (
    <main className="min-h-screen pt-28 pb-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <AdminNav onLogout={logout} />

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div>
            <span className="text-primary font-semibold text-sm">Admin report</span>
            <h1 className="text-3xl font-bold font-heading text-foreground">Website Analytics</h1>
          </div>
          <Button onClick={load} disabled={loading} className="ml-auto">
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <p className="text-destructive mb-4" role="alert">{error}</p>
        )}

        <div className="rounded-xl border border-border bg-card p-4 mb-6 flex flex-wrap items-end gap-3">
          <div className="flex gap-2"><Button variant="outline" onClick={()=>preset(1)}>Today</Button><Button variant="outline" onClick={()=>preset(7)}>7 days</Button><Button variant="outline" onClick={()=>preset(30)}>30 days</Button></div>
          <label className="text-sm text-muted-foreground">From<input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} className="block mt-1 rounded border border-input bg-background p-2 text-foreground"/></label>
          <label className="text-sm text-muted-foreground">To<input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} className="block mt-1 rounded border border-input bg-background p-2 text-foreground"/></label>
          <Button onClick={load} disabled={loading}>Apply timeframe</Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(([label, value, Icon]) => (
            <StatCard key={label} label={label} value={value} icon={Icon} />
          ))}
        </div>

        {data && (
          <>
            <Panel
              title="Contact clicks by app"
              note="Total clicks, and how many different people clicked. A repeat is the same person clicking again; identical double-taps within 2 seconds are not counted."
              className="mt-8"
            >
              <Table
                head={['App / type', 'Total clicks', 'People', 'Repeat clicks', 'Last click']}
                rows={data.channels.map((c) => [
                  <ChannelBadge key="c" channel={c.channel} />, c.total, c.unique, c.repeats, c.last ? istTime(c.last) : '',
                ])}
              />
            </Panel>

            <div className="grid lg:grid-cols-2 gap-6 mt-6">
              <Panel
                title="Visitor locations"
                note="City from the visitor's IP address, looked up on our own server. Mobile networks can place people in a nearby town."
              >
                <Table
                  head={['Location', 'People', 'Page views', 'Contact clicks', 'Forms']}
                  rows={data.locations.map((l) => [
                    <span key="l" className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />{l.location}</span>,
                    l.visitors, l.pageViews, l.contactClicks, l.formSubmissions,
                  ])}
                />
              </Panel>

              <Panel title="Most clicked">
                <Table
                  head={['Clicked', 'App / type', 'Total', 'People']}
                  rows={data.topClicks.slice(0, 15).map((c) => [
                    <span key="l" className="block max-w-[14rem] truncate" title={c.target}>{c.label || c.target || '(no label)'}</span>,
                    <ChannelBadge key="c" channel={c.channel} />, c.total, c.unique,
                  ])}
                />
              </Panel>
            </div>

            <Panel
              title="Click log"
              note="Every recorded click, newest first. Times are India Standard Time. Visitor is a short anonymous ID for the same browser."
              className="mt-6"
              action={
                <div className="flex flex-wrap gap-2">
                  <label className="sr-only" htmlFor="channel-filter">Show</label>
                  <select
                    id="channel-filter"
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                  >
                    <option value="contact">WhatsApp, call and email</option>
                    <option value="all">All clicks</option>
                    {Object.keys(CHANNEL_LABELS).map((c) => <option key={c} value={c}>{channelName(c)}</option>)}
                  </select>
                  <Button onClick={exportClicks} variant="outline">
                    <FileDown className="h-4 w-4 mr-2" aria-hidden /> Export clicks
                  </Button>
                </div>
              }
            >
              <Table
                head={['Time (IST)', 'Page', 'Clicked', 'App', 'Location', 'Device', 'Visitor']}
                rows={filteredClicks.map((c) => [
                  <span key="t" className="whitespace-nowrap">{istTime(c.createdAt)}</span>,
                  <span key="p" className="block max-w-[12rem] truncate" title={c.path}>{c.path}</span>,
                  <span key="l" className="block max-w-[12rem] truncate" title={c.target}>{c.label || c.target}</span>,
                  <ChannelBadge key="c" channel={c.channel} />,
                  c.location,
                  [c.device, c.os].filter(Boolean).join(' · '),
                  <span key="v" className="whitespace-nowrap">
                    {c.visitor}
                    {c.repeat > 1 && <span className="ml-1 rounded bg-muted px-1.5 text-[11px] text-muted-foreground">repeat #{c.repeat}</span>}
                  </span>,
                ])}
                empty="No clicks of this kind in the selected dates."
              />
            </Panel>

            <div className="grid lg:grid-cols-3 gap-6 mt-6">
              <Panel title="Top pages">
                <CountList rows={data.topPages} />
              </Panel>
              <Panel title="Traffic sources" note="Campaign tag, or the site the visitor came from.">
                <CountList rows={data.sources} />
              </Panel>
              <Panel title="Devices">
                <CountList rows={data.devices} />
              </Panel>
            </div>

            <Panel
              title="Search keywords and landing intent"
              note="Exact terms appear for tagged campaigns or site searches. Organic Google visits use the landing-page topic because Google normally hides the query."
              className="mt-6"
            >
              <CountList rows={data.keywords} className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4" />
            </Panel>

            <Panel
              title="Recent activity"
              className="mt-6"
              action={
                <Button onClick={exportEvents} variant="outline">
                  <FileDown className="h-4 w-4 mr-2" aria-hidden /> Export CSV
                </Button>
              }
            >
              <Table
                head={['Event', 'Time (IST)', 'Page', 'Seconds', 'Scroll', 'Location', 'Device']}
                rows={data.recentEvents.map((e) => [
                  String(e.eventType || ''),
                  <span key="t" className="whitespace-nowrap">{istTime(String(e.createdAt))}</span>,
                  <span key="p" className="block max-w-[14rem] truncate">{String(e.path || '')}</span>,
                  `${e.durationSeconds || 0}s`, `${e.scrollDepth || 0}%`,
                  [e.city, e.region, e.country].filter(Boolean).join(', ') || 'Unknown',
                  String(e.device || ''),
                ])}
                empty="No activity recorded yet."
              />
            </Panel>

            <p className="mt-6 text-xs text-muted-foreground">
              IP geolocation by <a className="underline" href="https://db-ip.com" target="_blank" rel="noopener noreferrer">DB-IP</a> (CC BY 4.0).
            </p>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminAnalytics;
