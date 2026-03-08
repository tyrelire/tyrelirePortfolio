export type AdminTab = "about" | "messages" | "visitors";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "about", label: "About" },
  { id: "messages", label: "Messages" },
  { id: "visitors", label: "Analyse visiteurs" },
];

export function AdminTabs(props: {
  activeTab: AdminTab;
  onChange: (tab: AdminTab) => void;
}) {
  return (
    <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => props.onChange(tab.id)}
            className={`rounded-lg px-4 py-2 text-sm text-left transition-colors ${props.activeTab === tab.id ? "bg-black text-white dark:bg-white dark:text-black" : "hover:bg-black/5 dark:hover:bg-white/10"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  );
}
