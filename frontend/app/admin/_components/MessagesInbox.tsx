import type { ContactMessage } from "../_lib/types";
import { panelClass } from "../_lib/constants";

export function MessagesInbox(props: {
  messages: ContactMessage[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  selected: ContactMessage | null;
  onRead: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  return (
    <section className={`${panelClass} p-5 md:p-6`}>
      {props.messages.length === 0 ? (
        <p className="text-sm opacity-75">No messages yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="overflow-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">From</th>
                  <th className="text-left p-2">Subject</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {props.messages.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer border-t ${props.selectedId === item.id ? "bg-black/10 dark:bg-white/10" : ""}`}
                    onClick={() => props.onSelect(item.id)}
                  >
                    <td className="p-2">{item.status}</td>
                    <td className="p-2">{item.email}</td>
                    <td className="p-2">{item.subject}</td>
                    <td className="p-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border rounded-lg p-3 space-y-3">
            {!props.selected ? (
              <p className="text-sm opacity-75">
                Select a message to view details.
              </p>
            ) : (
              <>
                <div>
                  <p className="text-xs opacity-60">From</p>
                  <p className="font-medium">{props.selected.name}</p>
                  <p className="text-sm opacity-80">{props.selected.email}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Subject</p>
                  <p className="font-medium">{props.selected.subject}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Message</p>
                  <p className="whitespace-pre-wrap text-sm">
                    {props.selected.message}
                  </p>
                </div>
                <div className="text-xs opacity-60 space-y-1">
                  <p>
                    Received:{" "}
                    {new Date(props.selected.createdAt).toLocaleString()}
                  </p>
                  <p>IP: {props.selected.ip ?? "unknown"}</p>
                  <p>Browser: {props.selected.userAgent ?? "unknown"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded border px-3 py-1.5 text-sm"
                    onClick={() => {
                      void props.onRead(props.selected!.id);
                    }}
                  >
                    Mark as read
                  </button>
                  <button
                    type="button"
                    className="rounded border px-3 py-1.5 text-sm"
                    onClick={() => {
                      void props.onDelete(props.selected!.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
