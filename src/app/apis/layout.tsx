import React from 'react';
import { Sidebar } from '@/components/common/Sidebar';

export default function APIsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar type="apis" />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
