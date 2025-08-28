export default function Home() {
  return (
    <section className="py-10">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Compare AWS, Azure, and GCP costs in seconds
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-neutral-300">
          Real-time pricing, normalized specs, and optimization tips to pick the most cost-effective cloud.
        </p>
      </div>
      <div className="mt-10 grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold">Real-time Pricing</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Uses official APIs for up-to-date rates.</p>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold">Side-by-side Compare</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Normalized compute, storage, and data transfer.</p>
        </div>
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold">Smart Recommendations</h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">Highlights cheapest options and savings.</p>
        </div>
      </div>
    </section>
  );
}


