export default function About() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">About</h1>
      <p className="text-gray-700 dark:text-neutral-300">
        Multi-Cloud Cost Calculator helps teams compare cloud pricing across AWS, Azure, and Google Cloud using real-time data and normalized specifications. It offers recommendations and visualizations to inform cost-efficient decisions.
      </p>
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-2">Project Abstract</h2>
        <p className="text-sm text-gray-700 dark:text-neutral-300">
          The application aggregates pricing via provider APIs, standardizes compute/storage/egress inputs, and delivers side-by-side comparisons and optimization insights. Optional features include authentication and saved histories.
        </p>
      </div>
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-2">Team</h2>
        <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-neutral-300 space-y-1">
          <li>Bibhudh Nepal (22BCE3873) – Frontend & Backend Development</li>
          <li>Aaryan Shrestha (22BCE3781) – Research & Algorithm Implementation</li>
        </ul>
      </div>
    </section>
  );
}


