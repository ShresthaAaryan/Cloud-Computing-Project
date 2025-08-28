const ARTICLES = [
  { title: "FinOps: Cloud Cost Optimization Best Practices", url: "https://www.finops.org/framework/" },
  { title: "Google Cloud Pricing Overview", url: "https://cloud.google.com/pricing" },
  { title: "AWS Pricing Calculator", url: "https://calculator.aws/" },
  { title: "Azure Pricing Calculator", url: "https://azure.microsoft.com/pricing/calculator/" },
];

export default function Research() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Research Articles</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {ARTICLES.map((a, i) => (
          <a key={i} href={a.url} target="_blank" rel="noreferrer" className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-500">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-400">{a.url}</p>
          </a>
        ))}
      </div>
    </section>
  );
}


