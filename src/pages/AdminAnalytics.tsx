import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Clock, Eye, FileDown, MousePointerClick, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminNav from '@/components/admin/AdminNav';
import { useAdminAuth } from '@/components/admin/useAdminAuth';
import { fetchAdminAnalytics, type AnalyticsReport } from '@/lib/api';

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

const AdminAnalytics = () => {
  const { token, loggingIn, login, logout, signedIn } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    fetchAdminAnalytics(token)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load analytics.'))
      .finally(() => setLoading(false));
  }, [token]);

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

  const cards: [string, string, typeof Eye][] = data
    ? [
        ['Page views', String(data.summary.pageViews), Eye],
        ['Sessions', String(data.summary.sessions), Users],
        ['Form submissions', String(data.summary.formSubmissions), MousePointerClick],
        ['Average time', `${data.summary.averageDurationSeconds}s`, Clock],
        ['Average scroll', `${data.summary.averageScrollDepth}%`, BarChart3],
      ]
    : [];

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['Event', 'Page', 'Keyword', 'Source', 'Time', 'Scroll', 'IP', 'City', 'Email'],
      ...data.recentEvents.map((e) => [
        e.eventType, e.path, e.searchTerm || e.landingKeyword, e.source,
        e.durationSeconds, e.scrollDepth, e.ip, e.city, e.email,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `asb-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map(([label, value, Icon]) => (
            <StatCard key={label} label={label} value={value} icon={Icon} />
          ))}
        </div>

        {data && (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mt-8">
              <Panel title="Top pages">
                <CountList rows={data.topPages} />
              </Panel>

              <Panel
                title="Visitor locations"
                note={'Uses location headers supplied by Cloudflare; “Unknown” appears when unavailable.'}
              >
                <CountList rows={data.locations} />
              </Panel>
            </div>

            <Panel
              title="Search keywords and landing intent"
              note="Exact terms appear for tagged campaigns or site searches. Organic Google visits use the landing-page topic because Google normally hides the query."
              className="mt-6"
            >
              <CountList
                rows={data.keywords}
                className="grid md:grid-cols-2 gap-x-8 gap-y-3 mt-4"
              />
            </Panel>

            <Panel
              title="Recent activity and conversions"
              className="mt-6"
              action={
                <Button onClick={exportCsv} variant="outline">
                  <FileDown className="h-4 w-4 mr-2" aria-hidden /> Export CSV
                </Button>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm mt-5">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border">
                      <th className="p-2 font-medium">Event</th>
                      <th className="p-2 font-medium">Page</th>
                      <th className="p-2 font-medium">Time</th>
                      <th className="p-2 font-medium">Scroll</th>
                      <th className="p-2 font-medium">IP / location</th>
                      <th className="p-2 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          No activity recorded yet.
                        </td>
                      </tr>
                    ) : (
                      data.recentEvents.map((e, i) => (
                        <tr key={String(e.id || i)} className="border-t border-border text-foreground">
                          <td className="p-2">{String(e.eventType || '')}</td>
                          <td className="p-2 truncate max-w-[16rem]">{String(e.path || '')}</td>
                          <td className="p-2">{String(e.durationSeconds || 0)}s</td>
                          <td className="p-2">{String(e.scrollDepth || 0)}%</td>
                          <td className="p-2">{String(e.ip || '')} {String(e.city || '')}</td>
                          <td className="p-2">{String(e.email || '')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </main>
  );
};

export default AdminAnalytics;
