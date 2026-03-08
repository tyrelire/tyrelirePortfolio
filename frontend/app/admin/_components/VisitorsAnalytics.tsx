type VisitorSummary = {
  visitorsCount: number;
  pageViewsCount: number;
  eventsCount: number;
};

type VisitorItem = {
  id: number;
  sessionId: string;
  actorRole: "ANON" | "ADMIN";
  isAuthenticated: boolean;
  ownerPseudo: string | null;
  ip: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  browserVersion: string | null;
  os: string | null;
  osVersion: string | null;
  device: string | null;
  language: string | null;
  timezone: string | null;
  isBot: boolean | null;
  firstSeenAt: string;
  lastSeenAt: string;
  _count: {
    pageViews: number;
    events: number;
  };
};

export function VisitorsAnalytics(props: {
  summary: VisitorSummary | null;
  visitors: VisitorItem[];
}) {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm p-5 md:p-6 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <article className="rounded-xl border p-4">
          <p className="text-xs opacity-70">Visitors</p>
          <p className="text-2xl font-semibold">
            {props.summary?.visitorsCount ?? 0}
          </p>
        </article>
        <article className="rounded-xl border p-4">
          <p className="text-xs opacity-70">Page Views</p>
          <p className="text-2xl font-semibold">
            {props.summary?.pageViewsCount ?? 0}
          </p>
        </article>
        <article className="rounded-xl border p-4">
          <p className="text-xs opacity-70">Events</p>
          <p className="text-2xl font-semibold">
            {props.summary?.eventsCount ?? 0}
          </p>
        </article>
      </div>

      <div className="overflow-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th className="text-left p-2">Profile</th>
              <th className="text-left p-2">IP</th>
              <th className="text-left p-2">Device</th>
              <th className="text-left p-2">Browser / OS</th>
              <th className="text-left p-2">Location</th>
              <th className="text-left p-2">Views</th>
              <th className="text-left p-2">Events</th>
              <th className="text-left p-2">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {props.visitors.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-2">
                  {item.actorRole}
                  {item.ownerPseudo ? ` (${item.ownerPseudo})` : ""}
                </td>
                <td className="p-2">{item.ip ?? "unknown"}</td>
                <td className="p-2">
                  {item.device ?? "unknown"}
                  {item.isBot ? " (bot)" : ""}
                </td>
                <td className="p-2">
                  {(item.browser ?? "?") +
                    (item.browserVersion ? ` ${item.browserVersion}` : "")}
                  <br />
                  <span className="opacity-70">
                    {(item.os ?? "?") +
                      (item.osVersion ? ` ${item.osVersion}` : "")}
                  </span>
                </td>
                <td className="p-2">
                  {item.city ?? "-"}
                  {item.country ? `, ${item.country}` : ""}
                </td>
                <td className="p-2">{item._count.pageViews}</td>
                <td className="p-2">{item._count.events}</td>
                <td className="p-2">
                  {new Date(item.lastSeenAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {props.visitors.length === 0 && (
              <tr>
                <td className="p-4 opacity-70" colSpan={8}>
                  No visitor data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
