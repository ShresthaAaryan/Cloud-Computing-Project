# Multi-Cloud Cost Calculator

A comprehensive web-based application for comparing cloud service costs across Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. This project implements research-based algorithms for cost optimization and provides intelligent recommendations for multi-cloud deployments.

## 🎯 Project Overview

This application enables users to compare and analyze cloud costs across multiple providers using real-time pricing data and normalized service specifications. It offers intelligent recommendations for cost optimization based on academic research in multi-cloud cost management.

### Key Features

- **Real-time Cost Comparison**: Compare compute, storage, and data transfer costs across AWS, Azure, and GCP
- **Multi-Provider Optimization**: Intelligent recommendations for single vs. mixed provider strategies
- **Regional Pricing**: Support for different geographic regions with varying pricing
- **Advanced Algorithms**: Implementation of research-based optimization algorithms
- **Interactive Visualizations**: Charts and graphs for cost analysis
- **Academic Research Integration**: Built on findings from leading cloud cost research papers

## 🏗️ Architecture

### Frontend
- **React 19** with Vite for fast development
- **Tailwind CSS** for modern, responsive UI
- **Recharts** for data visualization
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Enhanced pricing algorithms** based on academic research
- **Regional pricing support**
- **Intelligent optimization recommendations**

## 📚 Research Foundation

This project is built on extensive academic research in multi-cloud cost optimization:

### Key Research Papers
- **Zambianco et al.**: Multi-cloud microservice deployment optimization using Bin Packing Problem approach
- **Deochake et al.**: ABACUS automated FinOps solution for cloud cost management
- **Kodi et al.**: AI-driven multi-cloud FinOps and cost optimization
- **Tharwani et al.**: Comparative analysis of compute cost-performance across providers
- **Politani et al.**: Security and cost balance in hybrid cloud deployments
- **Quddus Khan et al.**: Comprehensive cloud cost taxonomy and optimization strategies

### Algorithm Implementation
- **Two-phase optimization** based on Bin Packing Problem
- **FinOps lifecycle** principles for cost management
- **Performance-aware recommendations** considering ARM vs. x86 architectures
- **Security-first approach** with Zero Trust model recommendations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for cloud providers (optional, for real-time pricing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-cloud-price-calculator
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configure API keys (optional)**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env file with your API keys
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173`

## 📖 Usage

### Basic Cost Comparison
1. Navigate to the Calculator page
2. Enter your usage requirements:
   - Compute hours
   - Storage (GB)
   - Data transfer (GB)
3. Optionally specify region and provider filters
4. Click "Compare Costs" to see results

### Advanced Features
- **Mix and Match**: Enable to see recommendations for using different providers for different services
- **Regional Pricing**: Select different regions to see cost variations
- **Optimization Tips**: Get intelligent recommendations based on your usage patterns

## 🔧 API Endpoints

### POST /compare
Compare costs across cloud providers using real-time pricing APIs

**Request Body:**
```json
{
  "computeHours": 100,
  "storageGB": 500,
  "dataGB": 50,
  "region": "us-east-1",
  "instanceSize": "m5.large",
  "provider": "AWS" // optional
}
```

**Response:**
```json
{
  "results": [
    {
      "provider": "AWS",
      "region": "us-east-1",
      "instanceSize": "m5.large",
      "breakdown": {
        "compute": 1.16,
        "storage": 11.5,
        "data": 4.5
      },
      "total": 17.16,
      "rates": {
        "compute": 0.0116,
        "storage": 0.023,
        "data": 0.09
      }
    }
  ],
  "recommendation": {
    "chosen": {
      "type": "single",
      "provider": "GCP",
      "total": 15.5
    },
    "savings": 1.66,
    "tips": [
      "Consider GCP for potential savings of $1.66 over AWS.",
      "Right-size compute resources to avoid overprovisioning."
    ]
  }
}
```

### GET /pricing/:provider
Get real-time pricing for a specific provider

**Parameters:**
- `provider`: AWS, Azure, or GCP
- `region`: Cloud region (default: us-east-1)
- `instanceType`: Instance type (default: m5.large)

**Example:**
```
GET /pricing/aws?region=us-west-2&instanceType=m5.xlarge
```

### GET /pricing/cache
Get pricing cache status

### POST /pricing/cache/clear
Clear pricing cache to force fresh API calls

## 🎓 Academic Context

This project addresses the critical need for cost-effective multi-cloud strategies as identified in recent academic literature. The implementation incorporates:

- **Cost normalization** across different provider pricing models
- **Intelligent resource allocation** algorithms
- **Performance-cost optimization** strategies
- **Security considerations** for multi-cloud deployments

## 🔮 Future Enhancements

### Planned Features
- **Enhanced API integration** with more detailed pricing data
- **Historical cost tracking** and trend analysis
- **AI-powered cost prediction** and optimization
- **Multi-region optimization** algorithms
- **Reserved instance recommendations**
- **Cost anomaly detection**
- **Spot instance pricing** integration
- **Container pricing** (ECS, EKS, AKS, GKE)

### Research Integration
- **Machine learning** for predictive cost modeling
- **Advanced FinOps** automation features
- **Microservice deployment** optimization
- **Edge computing** cost analysis

## 👥 Team

- **Aaryan Shrestha (22BCE3781)** - Frontend & Backend Development
- **Bibhudh Nepal (22BCE3873)** - Research & Algorithm Implementation

## 📄 License

This project is developed for academic research purposes.

## 🤝 Contributing

This is an academic project. For research collaborations or academic inquiries, please contact the team members.

## 📊 Performance

The application is optimized for:
- **Fast response times** (< 200ms for cost calculations)
- **Real-time updates** with live pricing data
- **Scalable architecture** supporting multiple concurrent users
- **Cross-platform compatibility** (desktop and mobile)

---
