const express = require("express");
const cors = require("cors");
const pricingService = require("./services/pricingService");

const app = express();
app.use(cors());
app.use(express.json());

// Regional pricing variations (multipliers)
const REGIONAL_PRICING = {
  'us-east-1': { AWS: 1.0, Azure: 1.0, GCP: 1.0 },
  'us-west-2': { AWS: 1.0, Azure: 1.0, GCP: 1.0 },
  'eu-west-1': { AWS: 1.1, Azure: 1.05, GCP: 1.08 },
  'ap-southeast-1': { AWS: 1.15, Azure: 1.12, GCP: 1.1 },
  'default': { AWS: 1.0, Azure: 1.0, GCP: 1.0 }
};

// Enhanced cost calculation with real-time API pricing and regional adjustments
async function calculateCosts({ computeHours, storageGB, dataGB, region = 'default', instanceSize = 'm5.large', fresh = false }) {
  const effectiveRegion = !region || region === 'default' ? 'us-east-1' : region;
  const regionalMultipliers = REGIONAL_PRICING[effectiveRegion] || REGIONAL_PRICING.default;

  try {
    // Get real-time pricing from APIs
    const pricingData = await pricingService.getAllPricing(effectiveRegion, instanceSize || 'm5.large', { fresh });

    return Object.keys(pricingData).map((provider) => {
      const baseRates = pricingData[provider];
      const multiplier = regionalMultipliers[provider] || 1.0;
      const rates = {
        compute: baseRates.compute * multiplier,
        storage: baseRates.storage * multiplier,
        data: baseRates.data * multiplier
      };

      const computeCost = (computeHours || 0) * rates.compute;
      const storageCost = (storageGB || 0) * rates.storage;
      const dataCost = (dataGB || 0) * rates.data;

      const total = computeCost + storageCost + dataCost;

      return {
        provider,
        region: effectiveRegion,
        instanceSize,
        breakdown: {
          compute: parseFloat(computeCost.toFixed(4)),
          storage: parseFloat(storageCost.toFixed(4)),
          data: parseFloat(dataCost.toFixed(4)),
        },
        total: parseFloat(total.toFixed(4)),
        rates: {
          compute: parseFloat(rates.compute.toFixed(6)),
          storage: parseFloat(rates.storage.toFixed(6)),
          data: parseFloat(rates.data.toFixed(6))
        }
      };
    });
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    // Fallback to static pricing if API fails
    return calculateCostsFallback({ computeHours, storageGB, dataGB, region, instanceSize });
  }
}

// Fallback cost calculation with static pricing
function calculateCostsFallback({ computeHours, storageGB, dataGB, region = 'default', instanceSize = 'm5.large' }) {
  const regionalMultipliers = REGIONAL_PRICING[region] || REGIONAL_PRICING.default;

  const FALLBACK_PRICE_TABLE = {
    AWS: { compute: 0.0116, storage: 0.023, data: 0.09 },
    Azure: { compute: 0.012, storage: 0.024, data: 0.085 },
    GCP: { compute: 0.01, storage: 0.020, data: 0.08 }
  };

  return Object.keys(FALLBACK_PRICE_TABLE).map((provider) => {
    const baseRates = FALLBACK_PRICE_TABLE[provider];
    const multiplier = regionalMultipliers[provider] || 1.0;
    const rates = {
      compute: baseRates.compute * multiplier,
      storage: baseRates.storage * multiplier,
      data: baseRates.data * multiplier
    };

    const computeCost = (computeHours || 0) * rates.compute;
    const storageCost = (storageGB || 0) * rates.storage;
    const dataCost = (dataGB || 0) * rates.data;

    const total = computeCost + storageCost + dataCost;

    return {
      provider,
      region: region === 'default' ? 'us-east-1' : region,
      instanceSize,
      breakdown: {
        compute: parseFloat(computeCost.toFixed(4)),
        storage: parseFloat(storageCost.toFixed(4)),
        data: parseFloat(dataCost.toFixed(4)),
      },
      total: parseFloat(total.toFixed(4)),
      rates: {
        compute: parseFloat(rates.compute.toFixed(6)),
        storage: parseFloat(rates.storage.toFixed(6)),
        data: parseFloat(rates.data.toFixed(6))
      }
    };
  });
}

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Get pricing cache status
app.get("/pricing/cache", (_req, res) => {
  try {
    const cacheStatus = pricingService.getCacheStatus();
    res.json({
      status: "ok",
      cache: cacheStatus
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to get cache status" });
  }
});

// Clear pricing cache
app.post("/pricing/cache/clear", (_req, res) => {
  try {
    pricingService.clearCache();
    res.json({ status: "ok", message: "Cache cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cache" });
  }
});

// Get current pricing for a specific provider
app.get("/pricing/:provider", async (req, res) => {
  try {
    const { provider } = req.params;
    const { region = 'us-east-1', instanceType = 'm5.large' } = req.query;

    let pricing;
    switch (provider.toLowerCase()) {
      case 'aws':
        pricing = await pricingService.getAWSPricing(region, instanceType);
        break;
      case 'azure':
        pricing = await pricingService.getAzurePricing(region, instanceType);
        break;
      case 'gcp':
        pricing = await pricingService.getGCPPricing(region, instanceType);
        break;
      default:
        return res.status(400).json({ error: "Invalid provider. Use AWS, Azure, or GCP" });
    }

    res.json({
      provider: provider.toUpperCase(),
      region,
      instanceType,
      pricing
    });
  } catch (error) {
    console.error(`Error fetching pricing for ${req.params.provider}:`, error);
    res.status(500).json({
      error: "Failed to fetch pricing data",
      details: error.message
    });
  }
});

// API endpoint (normalized shape ready)
app.post("/compare", async (req, res) => {
  const {
    provider, // optional filter: "AWS" | "Azure" | "GCP"
    region, // optional future use
    serviceType, // optional future use (compute, storage, data)
    instanceSize, // optional future use
    computeHours,
    storageGB,
    dataGB,
    fresh,
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

  try {
    // Calculate costs with real-time API pricing
    let results = await calculateCosts({ computeHours, storageGB, dataGB, region, instanceSize, fresh: Boolean(fresh) });
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

    // Enhanced recommendations based on research findings
    const tips = generateOptimizationTips(results, { computeHours, storageGB, dataGB });

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
  } catch (error) {
    console.error('Error in /compare endpoint:', error);
    res.status(500).json({
      error: "Failed to calculate costs. Please try again.",
      details: error.message
    });
  }
});

// Enhanced optimization tips based on research findings
function generateOptimizationTips(results, usage) {
  const tips = [];

  // Basic optimization tips
  tips.push("Right-size compute resources to avoid overprovisioning and reduce costs.");
  tips.push("Consider reserved instances for steady workloads - can save 30-60% compared to on-demand.");

  // Data transfer optimization (based on Kodi et al.)
  if (usage.dataGB > 100) {
    tips.push("High data transfer detected. Consider CDN or edge locations to reduce egress costs.");
  }

  // Storage optimization (based on Quddus Khan et al.)
  if (usage.storageGB > 1000) {
    tips.push("Large storage requirements detected. Consider lifecycle policies and storage tiers for cost optimization.");
  }

  // Multi-cloud optimization (based on Zambianco et al.)
  if (results.length > 1) {
    const cheapestProvider = results.reduce((a, b) => a.total < b.total ? a : b);
    const mostExpensiveProvider = results.reduce((a, b) => a.total > b.total ? a : b);
    const savings = mostExpensiveProvider.total - cheapestProvider.total;

    if (savings > 0.1) {
      tips.push(`Consider ${cheapestProvider.provider} for potential savings of $${savings.toFixed(2)} over ${mostExpensiveProvider.provider}.`);
    }
  }

  // Performance considerations (based on Tharwani et al.)
  tips.push("ARM-based instances often provide better price-performance ratio for cloud-native applications.");

  // Security considerations (based on Politani et al.)
  tips.push("Implement Zero Trust security model for multi-cloud deployments to ensure consistent security across providers.");

  return tips;
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
