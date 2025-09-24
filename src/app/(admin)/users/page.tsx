import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Manager',
};

export default function DashboardPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Account Manager</h1>
    </main>
  );
}
