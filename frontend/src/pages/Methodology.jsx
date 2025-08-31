export default function Methodology() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Methodology & Algorithms</h1>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Cost Calculation Algorithm</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Our cost calculation follows the normalized approach described in the literature,
            implementing a three-tier model that considers compute, storage, and data transfer costs
            across multiple cloud providers.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Formula:</h3>
            <p className="font-mono text-xs">
              Total Cost = (Compute Hours × Compute Rate) + (Storage GB × Storage Rate) + (Data GB × Data Transfer Rate)
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Multi-Provider Optimization</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Based on the Bin Packing Problem approach from Zambianco et al., we implement a
            two-phase optimization algorithm:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Phase 1: Allocation</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Identify cheapest provider per service type</li>
                <li>Calculate optimal resource distribution</li>
                <li>Minimize total deployment cost</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Phase 2: Optimization</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Compare single vs mixed provider strategies</li>
                <li>Calculate potential savings</li>
                <li>Generate cost optimization recommendations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">FinOps Integration</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Following the ABACUS framework principles, our system implements:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Cost Monitoring</h3>
              <p className="text-xs">Real-time cost tracking and comparison across providers</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Optimization Engine</h3>
              <p className="text-xs">Automated recommendations for cost reduction</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Alerting System</h3>
              <p className="text-xs">Notifications for cost anomalies and optimization opportunities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Performance Considerations</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Based on Tharwani et al.'s findings, our system considers:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Architecture Impact</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Intel (x86): High-performance, legacy compatibility</li>
                <li>AMD (x86): Balanced performance and cost</li>
                <li>ARM: Best price-performance ratio</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Cost-Performance Optimization</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Right-sizing recommendations</li>
                <li>Reserved instance suggestions</li>
                <li>Workload-specific optimizations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Real-Time API Integration</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Our system integrates with official cloud provider APIs to fetch real-time pricing data:
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">AWS Pricing API</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>EC2 instance pricing</li>
                <li>S3 storage rates</li>
                <li>Data transfer costs</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Azure Pricing API</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Virtual machine pricing</li>
                <li>Blob storage rates</li>
                <li>Network egress costs</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">GCP Pricing API</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Compute Engine pricing</li>
                <li>Cloud Storage rates</li>
                <li>Network pricing</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Caching Strategy</h3>
            <p className="text-xs">
              Pricing data is cached for 1 hour to reduce API calls and improve performance.
              Cache can be cleared via API endpoint to force fresh data retrieval.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Future Enhancements</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            Planned improvements based on research findings:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">AI Integration</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Automated cost allocation</li>
                <li>Idle resource detection</li>
                <li>Predictive cost modeling</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Advanced Features</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Enhanced API integration</li>
                <li>Historical cost tracking</li>
                <li>Multi-region optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
