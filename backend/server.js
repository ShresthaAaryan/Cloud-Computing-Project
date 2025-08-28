const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Mock price rates (USD per unit) — replace with real API calls later
const PRICE_TABLE = {
  AWS: { compute: 0.0116, storage: 0.023, data: 0.09 },
  Azure: { compute: 0.012, storage: 0.024, data: 0.085 },
  GCP: { compute: 0.01, storage: 0.020, data: 0.08 },
};

// Calculate cost for all providers
function calculateCosts({ computeHours, storageGB, dataGB }) {
  return Object.keys(PRICE_TABLE).map((provider) => {
    const rates = PRICE_TABLE[provider];

    const computeCost = (computeHours || 0) * rates.compute;
    const storageCost = (storageGB || 0) * rates.storage;
    const dataCost = (dataGB || 0) * rates.data;

    const total = computeCost + storageCost + dataCost;

    return {
      provider,
      breakdown: {
        compute: parseFloat(computeCost.toFixed(4)),
        storage: parseFloat(storageCost.toFixed(4)),
        data: parseFloat(dataCost.toFixed(4)),
      },
      total: parseFloat(total.toFixed(4)),
    };
  });
}

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// API endpoint (normalized shape ready)
app.post("/compare", (req, res) => {
  const {
    provider, // optional filter: "AWS" | "Azure" | "GCP"
    region, // optional future use
    serviceType, // optional future use (compute, storage, data)
    instanceSize, // optional future use
    computeHours,
    storageGB,
    dataGB,
  } = req.body;

  // Validate input
  if (
    computeHours == null ||
    storageGB == null ||
    dataGB == null
  ) {
    return res
      .status(400)
      .json({ error: "Please provide computeHours, storageGB, and dataGB" });
  }

  // Calculate costs
  let results = calculateCosts({ computeHours, storageGB, dataGB });
  if (provider) {
    results = results.filter((r) => r.provider === provider);
    if (results.length === 0) {
      return res.status(400).json({ error: "Unknown provider filter" });
    }
  }

  // Best single provider
  const bestSingle = results.reduce((a, b) => (a.total < b.total ? a : b));

  // Mixed: pick cheapest per component
  const cheapestFor = (key) => results.reduce((a, b) => (a.breakdown[key] < b.breakdown[key] ? a : b));
  const cheapestCompute = cheapestFor('compute');
  const cheapestStorage = cheapestFor('storage');
  const cheapestData = cheapestFor('data');
  const mixedTotal =
    cheapestCompute.breakdown.compute +
    cheapestStorage.breakdown.storage +
    cheapestData.breakdown.data;
  const mixed = {
    computeProvider: cheapestCompute.provider,
    storageProvider: cheapestStorage.provider,
    dataProvider: cheapestData.provider,
    breakdown: {
      compute: parseFloat(cheapestCompute.breakdown.compute.toFixed(4)),
      storage: parseFloat(cheapestStorage.breakdown.storage.toFixed(4)),
      data: parseFloat(cheapestData.breakdown.data.toFixed(4)),
    },
    total: parseFloat(mixedTotal.toFixed(4)),
  };

  const chosen = mixed.total < bestSingle.total
    ? { type: 'mixed', total: mixed.total }
    : { type: 'single', provider: bestSingle.provider, total: bestSingle.total };

  const savings = parseFloat((Math.max(bestSingle.total, mixed.total) - Math.min(bestSingle.total, mixed.total)).toFixed(4));

  const tips = [
    "Right-size compute (avoid overprovisioning).",
    "Reduce egress where possible; it often dominates costs.",
    "Consider reserved/committed discounts for steady workloads.",
  ];

  res.json({
    results,
    recommendation: {
      chosen,
      bestSingle,
      mixed,
      savings,
      tips,
    },
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
