interface Props {
  alerts: string[];
}

export default function AlertsPanel({ alerts }: Props) {
  return (
    <section className="bg-gray-800 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Alerts</h2>

      <ul className="space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className="text-yellow-400">
            {a}
          </li>
        ))}
      </ul>
    </section>
  );
}
