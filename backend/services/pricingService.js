const axios = require('axios');
require('dotenv').config();

class PricingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
  }

  // Get cached data or fetch new data
  async getCachedOrFetch(key, fetchFunction, options = {}) {
    const { fresh = false } = options;
    const cached = this.cache.get(key);
    if (!fresh && cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFunction();
      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return data;
    } catch (error) {
      console.error(`Error fetching pricing for ${key}:`, error.message);
      // Return fallback data if API fails
      return this.getFallbackPricing(key);
    }
  }

  // AWS Pricing using public Price List JSON
  async getAWSPricing(region = 'us-east-1', instanceType = 'm5.large', options = {}) {
    const cacheKey = `aws-${region}-${instanceType}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const effectiveRegion = !region || region === 'default' ? 'us-east-1' : region;
        const ec2IndexUrl = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/${effectiveRegion}/index.json`;
        const s3IndexUrl = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/index.json`;
        let ec2Resp;
        try {
          ec2Resp = await axios.get(ec2IndexUrl);
        } catch (e) {
          if (e?.response?.status === 404 && effectiveRegion !== 'us-east-1') {
            ec2Resp = await axios.get(`https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/us-east-1/index.json`);
          } else {
            throw e;
          }
        }
        const s3Resp = await axios.get(s3IndexUrl);
        const computeRate = this.extractAWSComputeRate(ec2Resp.data, instanceType, effectiveRegion);
        const storageRate = this.extractAWSStorageRate(s3Resp.data, effectiveRegion);
        const dataTransferRate = this.getAWSDataTransferRate(effectiveRegion);
        return { compute: computeRate, storage: storageRate, data: dataTransferRate };
      } catch (error) {
        console.error('AWS pricing fetch error:', error.message);
        throw error;
      }
    }, options);
  }

  // Azure Retail Prices API (public)
  async getAzurePricing(region = 'eastus', instanceType = 'D2s v3', options = {}) {
    const cacheKey = `azure-${region}-${instanceType}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const resp = await axios.get('https://prices.azure.com/api/retail/prices', {
          params: {
            '$filter': `serviceName eq 'Virtual Machines' and armRegionName eq '${region}' and skuName eq '${instanceType}' and priceType eq 'Consumption'`,
            '$top': 1
          }
        });
        const computeRate = this.extractAzureComputeRate(resp.data, instanceType);
        const storageRate = this.getAzureStorageRate(region);
        const dataTransferRate = this.getAzureDataTransferRate(region);
        return { compute: computeRate, storage: storageRate, data: dataTransferRate };
      } catch (error) {
        console.error('Azure pricing fetch error:', error.message);
        throw error;
      }
    }, options);
  }

  // GCP Cloud Billing Catalog API (requires API key)
  async getGCPPricing(region = 'us-central1', instanceType = 'e2-standard-2', options = {}) {
    const cacheKey = `gcp-${region}-${instanceType}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const apiKey = process.env.GCP_API_KEY;
        if (!apiKey) throw new Error('GCP API key not configured');
        const resp = await axios.get('https://cloudbilling.googleapis.com/v1/services/6F81-5844-456A/skus', { params: { key: apiKey } });
        const computeRate = this.extractGCPComputeRate(resp.data, instanceType, region);
        const storageRate = this.getGCPStorageRate(region);
        const dataTransferRate = this.getGCPDataTransferRate(region);
        return { compute: computeRate, storage: storageRate, data: dataTransferRate };
      } catch (error) {
        console.error('GCP pricing fetch error:', error.message);
        throw error;
      }
    }, options);
  }

  // Extract AWS compute rate from Price List JSON (simplified mapping)
  extractAWSComputeRate(data, instanceType, region) {
    try {
      // Map region code to AWS price list "location" string
      const regionToLocation = {
        'us-east-1': 'US East (N. Virginia)',
        'us-east-2': 'US East (Ohio)',
        'us-west-2': 'US West (Oregon)',
        'eu-west-1': 'EU (Ireland)',
        'ap-southeast-1': 'Asia Pacific (Singapore)'
      };
      const location = regionToLocation[region] || region;

      // Find product SKU that matches instanceType and location and on-demand
      const products = data.products || {};
      const terms = data.terms || {};

      const skuMatch = Object.values(products).find((p) =>
        p?.attributes?.instanceType === instanceType &&
        p?.attributes?.tenancy === 'Shared' &&
        p?.attributes?.operatingSystem === 'Linux' &&
        p?.attributes?.preInstalledSw === 'NA' &&
        p?.attributes?.capacitystatus === 'Used' &&
        p?.attributes?.location === location
      );

      if (!skuMatch) {
        return 0.0116; // fallback
      }

      const sku = skuMatch.sku;
      const onDemand = terms?.OnDemand?.[sku];
      if (!onDemand) return 0.0116;

      // Each on-demand term has priceDimensions with pricePerUnit USD per hour
      const term = Object.values(onDemand)[0];
      const priceDimensions = term?.priceDimensions || {};
      const pd = Object.values(priceDimensions)[0];
      const price = parseFloat(pd?.pricePerUnit?.USD || '0');
      return price || 0.0116;
    } catch (_e) {
      return 0.0116;
    }
  }

  extractAWSStorageRate(data, region) {
    return 0.023;
  }

  getAWSDataTransferRate(region) {
    const rates = {
      'us-east-1': 0.09,
      'us-west-2': 0.09,
      'eu-west-1': 0.09,
      'ap-southeast-1': 0.114
    };
    return rates[region] || 0.09;
  }

  extractAzureComputeRate(data, instanceType) {
    try {
      if (data.value && data.value.length > 0) {
        const price = data.value[0];
        return parseFloat(price.unitPrice);
      }
      return 0.012;
    } catch (_e) {
      return 0.012;
    }
  }

  getAzureStorageRate(region) { return 0.024; }
  getAzureDataTransferRate(region) { return 0.085; }

  extractGCPComputeRate(data, instanceType, region) {
    try {
      // Map common machine types to vCPU and memory
      const machineSpecs = {
        'e2-standard-2': { family: 'E2', vcpus: 2, memoryGb: 8 },
        'e2-standard-4': { family: 'E2', vcpus: 4, memoryGb: 16 },
        'n1-standard-2': { family: 'N1', vcpus: 2, memoryGb: 7.5 },
        'n1-standard-4': { family: 'N1', vcpus: 4, memoryGb: 15 }
      };

      const spec = machineSpecs[instanceType];
      if (!spec) {
        // Fallback to baseline if we don't recognize the machine type
        const baseRates = {
          'e2-standard-2': 0.01,
          'e2-standard-4': 0.02,
          'n1-standard-2': 0.0116,
          'n1-standard-4': 0.0232
        };
        return baseRates[instanceType] || 0.01;
      }

      const regionMatchesSku = (sku) => {
        const geoRegions = sku?.geoTaxonomy?.regions || [];
        const svcRegions = sku?.serviceRegions || [];
        return geoRegions.includes(region) || svcRegions.includes(region) || geoRegions.includes('global') || svcRegions.includes('global');
      };

      const findRate = (predicate) => {
        const sku = (data?.skus || []).find((s) => predicate(s) && regionMatchesSku(s));
        if (!sku) return null;
        const priceInfo = sku?.pricingInfo?.[0]?.pricingExpression;
        if (!priceInfo) return null;
        // Use the first tier rate per hour if available
        const unitConversion = priceInfo?.baseUnitConversionFactor || 1;
        const tierRate = priceInfo?.tieredRates?.[0]?.unitPrice;
        if (!tierRate) return null;
        const nanos = Number(tierRate.nanos || 0);
        const units = Number(tierRate.units || 0);
        const price = units + nanos / 1e9;
        // Convert to hourly if unit is seconds; otherwise assume already hourly
        const usageUnit = priceInfo.usageUnit || '';
        if (usageUnit.toLowerCase().includes('seconds')) {
          // price per second -> per hour
          return price * 3600 / unitConversion;
        }
        return price / unitConversion;
      };

      const family = spec.family.toUpperCase();
      // Core and RAM SKU descriptions typically follow patterns like:
      // "E2 Instance Core running in <region>" and "E2 Instance Ram running in <region>"
      const coreRate = findRate((s) =>
        s?.category?.resourceFamily === 'Compute' &&
        /Instance Core/i.test(s?.description || '') &&
        new RegExp(`^${family}\b`, 'i').test(s?.description || '')
      );
      const ramRate = findRate((s) =>
        s?.category?.resourceFamily === 'Compute' &&
        /Instance Ram/i.test(s?.description || '') &&
        new RegExp(`^${family}\b`, 'i').test(s?.description || '')
      );

      if (coreRate != null && ramRate != null) {
        const total = spec.vcpus * coreRate + spec.memoryGb * ramRate;
        return Number(total.toFixed(6));
      }

      // Fallback if specific SKUs not found
      const baseRates = {
        'e2-standard-2': 0.01,
        'e2-standard-4': 0.02,
        'n1-standard-2': 0.0116,
        'n1-standard-4': 0.0232
      };
      return baseRates[instanceType] || 0.01;
    } catch (_e) {
      return 0.01;
    }
  }

  getGCPStorageRate(region) { return 0.020; }
  getGCPDataTransferRate(region) { return 0.08; }

  // Fallback pricing when APIs fail
  getFallbackPricing(provider) {
    const fallbackRates = {
      'aws': { compute: 0.0116, storage: 0.023, data: 0.09 },
      'azure': { compute: 0.012, storage: 0.024, data: 0.085 },
      'gcp': { compute: 0.01, storage: 0.020, data: 0.08 }
    };

    const providerKey = provider.split('-')[0];
    return fallbackRates[providerKey] || fallbackRates['aws'];
  }

  // Get all provider pricing
  async getAllPricing(region = 'us-east-1', instanceType = 'm5.large', options = {}) {
    try {
      // Map generic inputs to provider-specific defaults to avoid mismatches
      const mapToProviders = (genericRegion, genericInstance) => {
        const isAwsRegion = /^(us|eu|ap|sa|ca|me|af)-[a-z]+-\d+$/.test(genericRegion || '');
        return {
          aws: {
            region: isAwsRegion ? genericRegion : 'us-east-1',
            instance: genericInstance && /\./.test(genericInstance) ? genericInstance : 'm5.large'
          },
          azure: {
            region: 'eastus',
            instance: (genericInstance && /[A-Za-z]\d/.test(genericInstance)) ? genericInstance : 'D2s v3'
          },
          gcp: {
            region: 'us-central1',
            instance: (genericInstance && /-/.test(genericInstance)) ? genericInstance : 'e2-standard-2'
          }
        };
      };

      const mapped = mapToProviders(region, instanceType);

      const [awsPricing, azurePricing, gcpPricing] = await Promise.allSettled([
        this.getAWSPricing(mapped.aws.region, mapped.aws.instance, options),
        this.getAzurePricing(mapped.azure.region, mapped.azure.instance, options),
        this.getGCPPricing(mapped.gcp.region, mapped.gcp.instance, options)
      ]);

      return {
        AWS: awsPricing.status === 'fulfilled' ? awsPricing.value : this.getFallbackPricing('aws'),
        Azure: azurePricing.status === 'fulfilled' ? azurePricing.value : this.getFallbackPricing('azure'),
        GCP: gcpPricing.status === 'fulfilled' ? gcpPricing.value : this.getFallbackPricing('gcp')
      };
    } catch (error) {
      console.error('Error fetching all pricing:', error);
      // Return fallback pricing if all APIs fail
      return {
        AWS: this.getFallbackPricing('aws'),
        Azure: this.getFallbackPricing('azure'),
        GCP: this.getFallbackPricing('gcp')
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Get cache status
  getCacheStatus() {
    const entries = Array.from(this.cache.entries());
    return {
      size: entries.length,
      entries: entries.map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }
}

module.exports = new PricingService();
