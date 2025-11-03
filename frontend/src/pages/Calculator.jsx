import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Scatter, ReferenceLine, LabelList, Cell } from "recharts";

export default function Calculator() {
  const [provider, setProvider] = useState("");
  const [region, setRegion] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [instanceSize, setInstanceSize] = useState("");
  const [computeHours, setComputeHours] = useState(10);
  const [storageGB, setStorageGB] = useState(50);
  const [dataGB, setDataGB] = useState(10);
  const [results, setResults] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mixMode, setMixMode] = useState(false);
  const [pricingStatus, setPricingStatus] = useState({ source: 'API', lastUpdated: null });
  const [forceRefresh, setForceRefresh] = useState(false);
  const [computeFrom, setComputeFrom] = useState("");
  const [storageFrom, setStorageFrom] = useState("");
  const [dataFrom, setDataFrom] = useState("");
  const [showRateRadar, setShowRateRadar] = useState(true);
  const [showBreakdownBars, setShowBreakdownBars] = useState(true);
  const [showSavingsBars, setShowSavingsBars] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [useCustomRegion, setUseCustomRegion] = useState(false);
  const [useCustomInstance, setUseCustomInstance] = useState(false);

  const API_BASE = (import.meta?.env?.VITE_API_BASE ?? "/api").replace(/\/$/, "");

  const handleCompare = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, region, serviceType, instanceSize, computeHours, storageGB, dataGB, fresh: forceRefresh }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err?.error || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setResults(data.results || []);
      setRecommendation(data.recommendation || null);
      setPricingStatus({ source: forceRefresh ? 'Forced Real-time API' : 'Real-time API', lastUpdated: new Date().toLocaleTimeString() });
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setErrorMessage(error?.message || 'Failed to fetch pricing');
      setPricingStatus({ source: 'Fallback Data', lastUpdated: new Date().toLocaleTimeString() });
    } finally {
      setLoading(false);
    }
  };

  const mixedPlan = useMemo(() => {
    if (!mixMode || results.length === 0) return null;
    const byProvider = (p) => results.find(r => r.provider === p);
    if (!byProvider) return null;
    const cheapestFor = (k) => results.reduce((a, b) => (a.breakdown[k] < b.breakdown[k] ? a : b));
    const chosenCompute = computeFrom ? byProvider(computeFrom) : cheapestFor('compute');
    const chosenStorage = storageFrom ? byProvider(storageFrom) : cheapestFor('storage');
    const chosenData = dataFrom ? byProvider(dataFrom) : cheapestFor('data');
    if (!chosenCompute || !chosenStorage || !chosenData) return null;
    const total = chosenCompute.breakdown.compute + chosenStorage.breakdown.storage + chosenData.breakdown.data;
    return {
      computeProvider: chosenCompute.provider,
      storageProvider: chosenStorage.provider,
      dataProvider: chosenData.provider,
      breakdown: {
        compute: chosenCompute.breakdown.compute,
        storage: chosenStorage.breakdown.storage,
        data: chosenData.breakdown.data,
      },
      total,
    };
  }, [mixMode, results, computeFrom, storageFrom, dataFrom]);

  const serverMixed = recommendation?.chosen?.type === 'mixed' && recommendation?.mixed ? recommendation.mixed : null;

  const chartData = useMemo(() => {
    const base = results.map(r => ({ name: r.provider, total: r.total }));
    if (mixedPlan) return [...base, { name: 'Mixed', total: mixedPlan.total }];
    if (serverMixed) return [...base, { name: 'Mixed', total: serverMixed.total }];
    return base;
  }, [results, mixedPlan, serverMixed]);

  const breakdownBarData = useMemo(() => {
    return results.map(r => ({
      name: r.provider,
      Compute: Number(r.breakdown.compute.toFixed(4)),
      Storage: Number(r.breakdown.storage.toFixed(4)),
      Data: Number(r.breakdown.data.toFixed(4))
    }));
  }, [results]);

  const savingsBarData = useMemo(() => {
    if (!results.length) return [];
    const mixedTotal = (mixMode && mixedPlan) ? mixedPlan.total : (serverMixed ? serverMixed.total : null);
    const candidateTotals = results.map(r => r.total);
    if (mixedTotal != null) candidateTotals.push(mixedTotal);
    const bestTotal = Math.min(...candidateTotals);
    const baseRows = results.map(r => ({ name: r.provider, delta: Number((r.total - bestTotal).toFixed(4)), kind: 'provider' }));
    if (mixedTotal != null) baseRows.push({ name: 'Mixed', delta: Number((mixedTotal - bestTotal).toFixed(4)), kind: 'mixed' });
    return baseRows.sort((a, b) => a.delta - b.delta);
  }, [results, mixMode, mixedPlan, serverMixed]);

  const rateRadarData = useMemo(() => {
    if (!results.length) return [];
    const computeRates = results.map(r => r.rates?.compute ?? 0).filter(n => n > 0);
    const storageRates = results.map(r => r.rates?.storage ?? 0).filter(n => n > 0);
    const dataRates = results.map(r => r.rates?.data ?? 0).filter(n => n > 0);
    const minCompute = Math.min(...computeRates);
    const minStorage = Math.min(...storageRates);
    const minData = Math.min(...dataRates);
    const providers = results.map(r => r.provider);
    const rows = [
      { metric: 'Compute' },
      { metric: 'Storage' },
      { metric: 'Data' }
    ];
    providers.forEach(p => {
      const r = results.find(x => x.provider === p);
      if (!r) return;
      rows[0][p] = minCompute > 0 ? Number((minCompute / (r.rates?.compute || minCompute)).toFixed(3)) : 1;
      rows[1][p] = minStorage > 0 ? Number((minStorage / (r.rates?.storage || minStorage)).toFixed(3)) : 1;
      rows[2][p] = minData > 0 ? Number((minData / (r.rates?.data || minData)).toFixed(3)) : 1;
    });
    return rows;
  }, [results]);

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Cost Calculator</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-600 dark:text-neutral-400">
              Pricing: {pricingStatus.source} • Updated: {pricingStatus.lastUpdated || 'Never'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Force refresh prices</label>
            <input type="checkbox" checked={forceRefresh} onChange={(e) => setForceRefresh(e.target.checked)} />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Mix and match providers</label>
            <input type="checkbox" checked={mixMode} onChange={(e) => setMixMode(e.target.checked)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Provider</label>
              <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <option value="">All</option>
                <option value="AWS">AWS</option>
                <option value="Azure">Azure</option>
                <option value="GCP">GCP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Region</label>
              {!useCustomRegion ? (
                <select
                  value={region || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setUseCustomRegion(true);
                      setRegion('');
                    } else {
                      setRegion(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <option value="">Auto (default)</option>
                  <option value="us-east-1">us-east-1 (N. Virginia)</option>
                  <option value="us-west-2">us-west-2 (Oregon)</option>
                  <option value="eu-west-1">eu-west-1 (Ireland)</option>
                  <option value="ap-southeast-1">ap-southeast-1 (Singapore)</option>
                  <option value="__custom__">Other (custom)...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Enter region code (e.g., us-east-1)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomRegion(false)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700"
                  >
                    Presets
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Service Type</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <option value="">All</option>
                <option value="compute">Compute</option>
                <option value="storage">Storage</option>
                <option value="data">Data Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Instance Size</label>
              {!useCustomInstance ? (
                <select
                  value={instanceSize || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__custom__') {
                      setUseCustomInstance(true);
                      setInstanceSize('');
                    } else {
                      setInstanceSize(val);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                >
                  <option value="">Auto (default)</option>
                  {/* AWS presets */}
                  <option value="m5.large">AWS: m5.large</option>
                  <option value="t3.medium">AWS: t3.medium</option>
                  {/* Azure presets */}
                  <option value="D2s v3">Azure: D2s v3</option>
                  <option value="B2s">Azure: B2s</option>
                  {/* GCP presets */}
                  <option value="e2-standard-2">GCP: e2-standard-2</option>
                  <option value="n1-standard-2">GCP: n1-standard-2</option>
                  <option value="__custom__">Other (custom)...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={instanceSize}
                    onChange={(e) => setInstanceSize(e.target.value)}
                    placeholder="Enter instance type (e.g., m5.large)"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                  />
                  <button
                    type="button"
                    onClick={() => setUseCustomInstance(false)}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700"
                  >
                    Presets
                  </button>
                </div>
              )}
            </div>
          </div>
          {mixMode && (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm mb-1">Compute from</label>
                <select value={computeFrom} onChange={(e) => setComputeFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                  <option value="">Auto (cheapest)</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Storage from</label>
                <select value={storageFrom} onChange={(e) => setStorageFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                  <option value="">Auto (cheapest)</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Data transfer from</label>
                <select value={dataFrom} onChange={(e) => setDataFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                  <option value="">Auto (cheapest)</option>
                  <option value="AWS">AWS</option>
                  <option value="Azure">Azure</option>
                  <option value="GCP">GCP</option>
                </select>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Compute Hours</label>
            <input type="number" value={computeHours} onChange={(e) => setComputeHours(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Storage (GB)</label>
            <input type="number" value={storageGB} onChange={(e) => setStorageGB(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Data Transfer (GB)</label>
            <input type="number" value={dataGB} onChange={(e) => setDataGB(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800" />
          </div>
          <button onClick={handleCompare} disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2 rounded-lg">
            {loading ? "Comparing..." : "Compare Costs"}
          </button>
        </div>
        <div className="md:col-span-2 space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-200 text-sm">
              {errorMessage}
            </div>
          )}
          {recommendation && (
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              {recommendation?.chosen?.type === 'single' ? (
                <p className="text-sm">Recommended: <span className="font-semibold">{recommendation.chosen.provider}</span> (${recommendation.chosen.total?.toFixed(4)})</p>
              ) : (
                <p className="text-sm">Recommended: <span className="font-semibold">Mixed</span> ({recommendation?.mixed?.computeProvider}/{recommendation?.mixed?.storageProvider}/{recommendation?.mixed?.dataProvider}) (${recommendation?.mixed?.total?.toFixed(4)})</p>
              )}
              {typeof recommendation?.savings === 'number' && recommendation.savings > 0 && (
                <p className="text-xs text-gray-600 dark:text-neutral-400 mt-1">Savings vs alternative: ${recommendation.savings.toFixed(4)}</p>
              )}
            </div>
          )}
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <h2 className="font-semibold mb-4">Results</h2>
            {results.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-neutral-400">No results yet. Enter usage and compare.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2">Provider</th>
                      <th className="py-2">Compute</th>
                      <th className="py-2">Storage</th>
                      <th className="py-2">Data</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-2 font-medium">{r.provider}</td>
                        <td className="py-2">${r.breakdown.compute.toFixed(4)}</td>
                        <td className="py-2">${r.breakdown.storage.toFixed(4)}</td>
                        <td className="py-2">${r.breakdown.data.toFixed(4)}</td>
                        <td className="py-2 font-semibold">${r.total.toFixed(4)}</td>
                        <td className="py-2">{recommendation?.chosen?.type === 'single' && recommendation?.chosen?.provider === r.provider ? "Cheapest" : ""}</td>
                      </tr>
                    ))}
                    {(mixMode && mixedPlan) || serverMixed ? (() => {
                      const m = mixMode && mixedPlan ? mixedPlan : serverMixed;
                      return (
                        <tr className="border-t border-neutral-200 dark:border-neutral-800 bg-blue-50/40 dark:bg-neutral-800/40">
                          <td className="py-2 font-medium">Mixed ({m.computeProvider}/{m.storageProvider}/{m.dataProvider})</td>
                          <td className="py-2">${m.breakdown.compute.toFixed(4)}</td>
                          <td className="py-2">${m.breakdown.storage.toFixed(4)}</td>
                          <td className="py-2">${m.breakdown.data.toFixed(4)}</td>
                          <td className="py-2 font-semibold">${m.total.toFixed(4)}</td>
                          <td className="py-2">{recommendation?.chosen?.type === 'mixed' ? "Cheapest" : ""}</td>
                        </tr>
                      );
                    })() : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Visualization</h2>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={showBreakdownBars} onChange={e => setShowBreakdownBars(e.target.checked)} /> Breakdown bars</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={showRateRadar} onChange={e => setShowRateRadar(e.target.checked)} /> Rate radar</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={showSavingsBars} onChange={e => setShowSavingsBars(e.target.checked)} /> Savings vs Best</label>
              </div>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-neutral-400">Run a comparison to see the chart.</p>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {showBreakdownBars && (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={breakdownBarData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Compute" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Storage" stackId="a" fill="#10b981" />
                        <Bar dataKey="Data" stackId="a" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {showRateRadar && (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={rateRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={30} domain={[0, 1]} />
                        {results.map((r, idx) => (
                          <Radar key={r.provider} name={r.provider} dataKey={r.provider} stroke={['#3b82f6', '#10b981', '#f59e0b'][idx % 3]} fill={['#3b82f6', '#10b981', '#f59e0b'][idx % 3]} fillOpacity={0.25} />
                        ))}
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {showSavingsBars && (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={savingsBarData} layout="vertical">
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} domain={[0, 'dataMax']} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(v) => [`$${Number(v).toFixed(4)}`, 'Delta vs Best']} />
                        <ReferenceLine x={0} stroke="#e5e7eb" />
                        {/* Lollipop stem */}
                        <Bar dataKey="delta" barSize={6} name="Delta vs Best" fill="#cbd5e1" radius={[0, 6, 6, 0]}>
                          <LabelList dataKey="delta" position="right" formatter={(v) => `$${Number(v).toFixed(4)}`} className="fill-current text-xs" />
                          {savingsBarData.map((row, idx) => (
                            <Cell key={`stem-${idx}`} fill={row.delta === 0 ? '#10b981' : (row.kind === 'mixed' ? '#3b82f6' : '#cbd5e1')} />
                          ))}
                        </Bar>
                        {/* Lollipop head */}
                        <Scatter dataKey="delta">
                          {savingsBarData.map((row, idx) => (
                            <Cell key={`dot-${idx}`} fill={row.delta === 0 ? '#10b981' : (row.kind === 'mixed' ? '#3b82f6' : '#ef4444')} />
                          ))}
                        </Scatter>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <h2 className="font-semibold mb-3">Recommendations</h2>
            {recommendation ? (
              <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-neutral-300 space-y-1">
                {recommendation?.chosen?.type === 'single' && recommendation?.chosen ? (
                  <li>Cheapest overall (single): {recommendation.chosen.provider} (${recommendation.chosen.total?.toFixed(4)})</li>
                ) : recommendation?.chosen?.type === 'mixed' && recommendation?.mixed ? (
                  <li>Cheapest overall (mixed): {recommendation.mixed.computeProvider}/{recommendation.mixed.storageProvider}/{recommendation.mixed.dataProvider} (${recommendation.mixed.total?.toFixed(4)})</li>
                ) : null}
                {typeof recommendation?.savings === 'number' && recommendation.savings > 0 && (
                  <li>Potential savings vs alternative: ${recommendation.savings.toFixed(4)}</li>
                )}
                {recommendation?.tips?.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600 dark:text-neutral-400">Run a comparison to get tailored suggestions.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


