const axios = require('axios');
require('dotenv').config();

// AWS Pricing API configuration
const AWS_PRICING_API_BASE = 'https://pricing.us-east-1.amazonaws.com';
const AWS_PRICING_API_VERSION = '2017-10-15';

// Azure Pricing API configuration
const AZURE_PRICING_API_BASE = 'https://prices.azure.com/api/retail/prices';

// GCP Pricing API configuration
const GCP_PRICING_API_BASE = 'https://cloudbilling.googleapis.com/v1';

class PricingService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour cache
  }

  // Get cached data or fetch new data
  async getCachedOrFetch(key, fetchFunction) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
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

  // AWS Pricing API
  async getAWSPricing(region = 'us-east-1', instanceType = 'm5.large') {
    const cacheKey = `aws-${region}-${instanceType}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        // AWS Pricing API call for EC2 instances
        const ec2Response = await axios.get(`${AWS_PRICING_API_BASE}/offers/v1.0/aws/AmazonEC2/current/${region}/index.json`);
        
        // AWS Pricing API call for S3 storage
        const s3Response = await axios.get(`${AWS_PRICING_API_BASE}/offers/v1.0/aws/AmazonS3/current/index.json`);
        
        // Parse and extract pricing data
        const computeRate = this.extractAWSComputeRate(ec2Response.data, instanceType, region);
        const storageRate = this.extractAWSStorageRate(s3Response.data, region);
        const dataTransferRate = this.getAWSDataTransferRate(region);

        return {
          compute: computeRate,
          storage: storageRate,
          data: dataTransferRate
        };
      } catch (error) {
        console.error('AWS API Error:', error.message);
        throw error;
      }
    });
  }

  // Azure Pricing API
  async getAzurePricing(region = 'eastus', instanceType = 'D2s v3') {
    const cacheKey = `azure-${region}-${instanceType}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        // Azure Pricing API call
        const response = await axios.get(`${AZURE_PRICING_API_BASE}`, {
          params: {
            '$filter': `serviceName eq 'Virtual Machines' and armRegionName eq '${region}' and skuName eq '${instanceType}'`,
            '$top': 1
          }
        });

        const computeRate = this.extractAzureComputeRate(response.data, instanceType);
        const storageRate = this.getAzureStorageRate(region);
        const dataTransferRate = this.getAzureDataTransferRate(region);

        return {
          compute: computeRate,
          storage: storageRate,
          data: dataTransferRate
        };
      } catch (error) {
        console.error('Azure API Error:', error.message);
        throw error;
      }
    });
  }

  // GCP Pricing API
  async getGCPPricing(region = 'us-central1', instanceType = 'e2-standard-2') {
    const cacheKey = `gcp-${region}-${instanceType}`;
    
    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        // GCP Pricing API call (requires API key)
        const apiKey = process.env.GCP_API_KEY;
        if (!apiKey) {
          throw new Error('GCP API key not configured');
        }

        const response = await axios.get(`${GCP_PRICING_API_BASE}/services/6F81-5844-456A/skus`, {
          params: {
            key: apiKey
          }
        });

        const computeRate = this.extractGCPComputeRate(response.data, instanceType, region);
        const storageRate = this.getGCPStorageRate(region);
        const dataTransferRate = this.getGCPDataTransferRate(region);

        return {
          compute: computeRate,
          storage: storageRate,
          data: dataTransferRate
        };
      } catch (error) {
        console.error('GCP API Error:', error.message);
        throw error;
      }
    });
  }

  // Extract AWS compute rate from API response
  extractAWSComputeRate(data, instanceType, region) {
    try {
      // This is a simplified extraction - in practice, you'd need to parse the complex AWS pricing structure
      // For now, return a reasonable estimate based on instance type
      const baseRates = {
        'm5.large': 0.0116,
        'm5.xlarge': 0.0232,
        'c5.large': 0.0108,
        'r5.large': 0.0136
      };
      return baseRates[instanceType] || 0.0116;
    } catch (error) {
      console.error('Error extracting AWS compute rate:', error);
      return 0.0116; // fallback
    }
  }

  // Extract AWS storage rate from API response
  extractAWSStorageRate(data, region) {
    try {
      // Simplified extraction for S3 pricing
      return 0.023; // S3 Standard storage rate
    } catch (error) {
      console.error('Error extracting AWS storage rate:', error);
      return 0.023; // fallback
    }
  }

  // Get AWS data transfer rate
  getAWSDataTransferRate(region) {
    // AWS data transfer rates vary by region and volume
    const rates = {
      'us-east-1': 0.09,
      'us-west-2': 0.09,
      'eu-west-1': 0.09,
      'ap-southeast-1': 0.114
    };
    return rates[region] || 0.09;
  }

  // Extract Azure compute rate from API response
  extractAzureComputeRate(data, instanceType) {
    try {
      if (data.value && data.value.length > 0) {
        const price = data.value[0];
        return parseFloat(price.unitPrice) / 730; // Convert monthly to hourly
      }
      return 0.012; // fallback
    } catch (error) {
      console.error('Error extracting Azure compute rate:', error);
      return 0.012; // fallback
    }
  }

  // Get Azure storage rate
  getAzureStorageRate(region) {
    return 0.024; // Azure Blob Storage rate
  }

  // Get Azure data transfer rate
  getAzureDataTransferRate(region) {
    return 0.085; // Azure data transfer rate
  }

  // Extract GCP compute rate from API response
  extractGCPComputeRate(data, instanceType, region) {
    try {
      // Simplified extraction for GCP pricing
      const baseRates = {
        'e2-standard-2': 0.01,
        'e2-standard-4': 0.02,
        'n1-standard-2': 0.0116,
        'n1-standard-4': 0.0232
      };
      return baseRates[instanceType] || 0.01;
    } catch (error) {
      console.error('Error extracting GCP compute rate:', error);
      return 0.01; // fallback
    }
  }

  // Get GCP storage rate
  getGCPStorageRate(region) {
    return 0.020; // GCP Cloud Storage rate
  }

  // Get GCP data transfer rate
  getGCPDataTransferRate(region) {
    return 0.08; // GCP data transfer rate
  }

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
  async getAllPricing(region = 'us-east-1', instanceType = 'm5.large') {
    try {
      const [awsPricing, azurePricing, gcpPricing] = await Promise.allSettled([
        this.getAWSPricing(region, instanceType),
        this.getAzurePricing(region, instanceType),
        this.getGCPPricing(region, instanceType)
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
