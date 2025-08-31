const ARTICLES = [
  { 
    title: "Multi-Cloud Microservice Deployment Optimization", 
    authors: "Zambianco et al.",
    summary: "Presents optimal and heuristic solutions for cost-minimizing microservice deployment across multiple cloud providers using Bin Packing Problem approach.",
    category: "Deployment Optimization"
  },
  { 
    title: "ABACUS: Automated FinOps Solution", 
    authors: "Deochake et al.",
    summary: "Automated service following FinOps lifecycle principles for cloud cost management and optimization with real-time monitoring and alerting.",
    category: "FinOps & Cost Management"
  },
  { 
    title: "AI in Multi-Cloud FinOps", 
    authors: "Kodi et al.",
    summary: "Explores AI solutions for automating cost allocation, detecting idle resources, and optimizing multi-cloud cost management.",
    category: "AI & Automation"
  },
  { 
    title: "Cloud Compute Cost-Performance Analysis", 
    authors: "Tharwani et al.",
    summary: "Comparative analysis of Intel, AMD, and ARM instances across AWS, Azure, GCP, and OCI showing ARM's superior price-performance ratio.",
    category: "Performance Analysis"
  },
  { 
    title: "Hybrid Cloud Security & Cost Balance", 
    authors: "Politani et al.",
    summary: "Discusses challenges in balancing security, performance, cost, and compliance in hybrid cloud deployments with Zero Trust security model.",
    category: "Security & Compliance"
  },
  { 
    title: "Cloud Cost Taxonomy & Optimization", 
    authors: "Quddus Khan et al.",
    summary: "Detailed taxonomy of cloud costs including storage, replication, transaction, network, and encryption costs with optimization strategies.",
    category: "Cost Taxonomy"
  }
];

const EXTERNAL_LINKS = [
  { title: "FinOps: Cloud Cost Optimization Best Practices", url: "https://www.finops.org/framework/" },
  { title: "Google Cloud Pricing Overview", url: "https://cloud.google.com/pricing" },
  { title: "AWS Pricing Calculator", url: "https://calculator.aws/" },
  { title: "Azure Pricing Calculator", url: "https://azure.microsoft.com/pricing/calculator/" },
];

export default function Research() {
  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Research Literature Review</h1>
      
      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Key Research Papers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {ARTICLES.map((article, i) => (
            <div key={i} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{article.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {article.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mb-2">Authors: {article.authors}</p>
              <p className="text-sm text-gray-700 dark:text-neutral-300">{article.summary}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">External Resources</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {EXTERNAL_LINKS.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-blue-500 transition-colors">
              <h3 className="font-semibold text-sm">{link.title}</h3>
              <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">{link.url}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


