import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/jobs', label: 'Trabajos' },
  { href: '/workers', label: 'Trabajadores' },
  { href: '/clients', label: 'Clientes' },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-panel">
      <div className="border-b border-border px-5 py-5">
        <div className="text-sm font-bold tracking-tight text-white">FOA</div>
        <div className="text-xs text-zinc-500">FieldOpsAgent</div>
      </div>
      <nav className="flex-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-panel2 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border px-5 py-4 text-xs text-zinc-500">
        Recursos No Humanos
      </div>
    </aside>
  );
}
