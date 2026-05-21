export default function PageTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-5 py-2 text-sm font-medium rounded-t-lg border transition-colors focus:outline-none ${
            activeTab === tab.key
              ? 'bg-white dark:bg-background-dark text-primary border-gray-200 dark:border-gray-700 border-b-transparent -mb-px'
              : 'bg-gray-50 dark:bg-gray-800/40 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white border-transparent'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}