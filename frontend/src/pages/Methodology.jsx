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
        <h2 className="font-semibold mb-4">Live Pricing Sources & Caching</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>We fetch prices directly from official public sources and normalize them:</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">AWS (no key)</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>EC2 On‑Demand: AWS Price List JSON (per region)</li>
                <li>S3 Standard: AWS Price List JSON</li>
                <li>Egress: conservative regional defaults</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Azure (no key)</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Retail Prices API: VM hourly rates by region/SKU</li>
                <li>Blob Standard + egress: normalized defaults</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">GCP (API key)</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Cloud Billing Catalog: sums per‑core + per‑GB RAM</li>
                <li>Requires GCP_API_KEY; otherwise falls back</li>
              </ul>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Cache & Fresh Fetch</h3>
            <ul className="list-disc pl-4 text-xs space-y-1">
              <li>1‑hour in‑memory cache per provider/region/instance</li>
              <li>“Force refresh prices” toggle bypasses cache</li>
              <li>Cache endpoint: POST /pricing/cache/clear</li>
              <li>Fast‑path: if no valid cache and no force refresh, we return fallback instantly</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Regional Handling & Presets</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Region</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Presets: us‑east‑1, us‑west‑2, eu‑west‑1, ap‑southeast‑1</li>
                <li>Custom: accepts any provider region code</li>
                <li>Fallback mode applies light regional multipliers when live rates aren’t used</li>
              </ul>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Instance Size</h3>
              <ul className="list-disc pl-4 text-xs space-y-1">
                <li>Presets: AWS m5.large/t3.medium, Azure D2s v3/B2s, GCP e2‑standard‑2/n1‑standard‑2</li>
                <li>Custom: accepts any instance/SKU name</li>
                <li>Inputs are mapped per provider to avoid mismatches (e.g., EC2 vs Azure SKU vs GCP machine)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Timeout & Fallback Policy</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>Live provider calls use a short timeout (default 4s; configurable)</li>
            <li>On timeout or error, we fall back to normalized static rates</li>
            <li>When “Force refresh prices” is off, we skip live calls if cache is cold to keep UX instant</li>
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Provider-Specific Mapping</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <p>
            To avoid cross‑cloud input mismatches, generic inputs are translated per provider:
          </p>
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>AWS defaults: region <span className="font-mono">us-east-1</span>, instance <span className="font-mono">m5.large</span></li>
            <li>Azure defaults: region <span className="font-mono">eastus</span>, SKU <span className="font-mono">D2s v3</span></li>
            <li>GCP defaults: region <span className="font-mono">us-central1</span>, machine <span className="font-mono">e2-standard-2</span></li>
          </ul>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h2 className="font-semibold mb-4">Visualization & Recommendations</h2>
        <div className="space-y-4 text-sm text-gray-700 dark:text-neutral-300">
          <ul className="list-disc pl-5 text-xs space-y-1">
            <li>Total cost bar chart per provider</li>
            <li>Stacked breakdown bars: compute, storage, data</li>
            <li>Rate radar: normalized per‑metric price comparison</li>
            <li>Server and client “mixed” strategy comparisons</li>
          </ul>
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
