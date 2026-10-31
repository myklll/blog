export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="min-w-full divide-y divide-ink">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-ink">
      {children}
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      {children}
    </tbody>
  );
}

export function TR({ children }: { children: React.ReactNode }) {
  return <tr>{children}</tr>;
}

export function TH({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
      {children}
    </th>
  );
}

export function TD({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4 text-sm text-ink">
      {children}
    </td>
  );
}