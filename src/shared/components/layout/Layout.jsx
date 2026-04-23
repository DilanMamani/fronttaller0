import { useState } from 'react';
import Sidebar from './SideBar';
import Header from './Header';

export default function Layout({ title, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="font-display h-screen flex flex-col bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header title={title} onMenuClick={() => setSidebarOpen(true)} />
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-gray-900">{children}</div>
        </main>
      </div>
    </div>
  );
}