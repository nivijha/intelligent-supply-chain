# Research Review

---

## 10. Research Review

### 10.1 Paper 1: Decision-Support System for Supply-Chain Uncertainty

**Title:** "A generalized concept of a decision-support system for responses to tariff-induced uncertainty and disruptions"

| Aspect | Details |
|--------|---------|
| **Problem addressed** | How to build decision-support systems that respond to uncertainty and disruptions in supply chains |
| **Method used** | Framework integrating predictive analytics (forecasting), prescriptive analytics (recommendations), and multiple information sources |
| **Important idea** | Decision-support systems should combine different types of analytics to help decision-makers respond to uncertainty |
| **What we learn** | Effective decision support requires integration of prediction, analysis, and recommendation, not just data display |
| **What we adopt** | The concept of combining forecasting with rule-based recommendations in an integrated workflow |
| **What we simplify** | We do not model tariff-specific disruptions; we focus on general demand uncertainty in food supply chains |
| **How it relates** | Supports our architecture of combining ML predictions with business-rule recommendations |
| **Limitation/research gap** | The paper focuses on tariff-induced uncertainty; food supply chains face different uncertainty sources (weather, policy, seasonality) |

### 10.2 Paper 2: Multi-Scale Demand Forecasting

**Title:** "Multi-scale global supply chain spatiotemporal demand forecasting based on Mamba SSM state space backbone"

| Aspect | Details |
|--------|---------|
| **Problem addressed** | Demand forecasting across multiple scales (temporal and spatial) using advanced sequence modeling |
| **Method used** | Mamba-based state space model for capturing long-range dependencies in spatiotemporal demand data |
| **Important idea** | Demand patterns operate at multiple scales (daily, weekly, monthly, seasonal) and have spatial dimensions (regional variation) |
| **What we learn** | Forecasting must consider temporal patterns, seasonality, and external factors for accuracy |
| **What we adopt** | The importance of demand forecasting as a core component; recognition of temporal and spatial dimensions |
| **What we simplify** | We use ARIMA/Prophet (baseline) and XGBoost instead of Mamba; we do not implement spatiotemporal modeling at multiple scales |
| **How it relates** | Validates demand forecasting as essential for supply-chain decision support |
| **Limitation/research gap** | Mamba requires large datasets, GPU resources, and complex implementation; not suitable for a student prototype with limited data |

### 10.3 Paper 3: Deep Fusion for Inventory Optimization

**Title:** "A deep fusion framework for end-to-end multi-product inventory optimization in e-commerce scenarios"

| Aspect | Details |
|--------|---------|
| **Problem addressed** | Optimizing inventory decisions across multiple products by fusing demand forecasts with inventory constraints |
| **Method used** | Deep learning framework combining demand prediction with inventory optimization |
| **Important idea** | Demand forecasting and inventory decisions are deeply coupled; forecasting alone is insufficient without inventory implications |
| **What we learn** | Forecast outputs should directly inform inventory status analysis and replenishment recommendations |
| **What we adopt** | The concept of linking forecast outputs to inventory analysis and generating actionable recommendations |
| **What we simplify** | We use forecast + operational constraints + business rules instead of deep-learning optimization; we do not optimize across products end-to-end |
| **How it relates** | Supports our inventory analysis and recommendation engine architecture |
| **Limitation/research gap** | E-commerce inventory dynamics differ from public food distribution; deep learning complexity exceeds prototype requirements |

### 10.4 Paper 4: Explainable AI in Logistics

**Title:** "Explainable artificial intelligence in transport Logistics: Risk analysis for road accidents"

| Aspect | Details |
|--------|---------|
| **Problem addressed** | Making ML predictions understandable for decision-makers in logistics contexts |
| **Method used** | SHAP (SHapley Additive exPlanations) for feature importance analysis |
| **Important idea** | Feature importance explanations help decision-makers understand and trust ML predictions |
| **What we learn** | Explainability is critical for adoption of ML in operational decision-making |
| **What we adopt** | SHAP-based feature importance for explaining demand forecasts and recommendations |
| **What we simplify** | We apply SHAP to supply-chain forecasting rather than accident risk analysis; simpler feature sets than transport logistics |
| **How it relates** | Supports our explainability layer for transparent predictions and recommendations |
| **Limitation/research gap** | Road accident domain differs from food supply chains; feature sets and decision contexts are different |

### 10.5 Paper 5: RAG for Supply-Chain Mapping

**Title:** "Supply chain mapping through retrieval-augmented generation: applications to the electronics industry"

| Aspect | Details |
|--------|---------|
| **Problem addressed** | Extracting and using information from unstructured supply-chain documents |
| **Method used** | Retrieval-Augmented Generation (RAG) combining document retrieval with language model generation |
| **Important idea** | RAG provides grounded answers from documents, reducing hallucination compared to standalone LLMs |
| **What we learn** | RAG can effectively extract supply-chain knowledge from unstructured documents |
| **What we adopt** | RAG architecture for document-grounded knowledge retrieval |
| **What we simplify** | We focus on official Indian government documents rather than electronics industry supply chains; simpler document corpus |
| **How it relates** | Supports our RAG assistant for government policy and guideline retrieval |
| **Limitation/research gap** | Electronics supply chains have different document types and knowledge requirements than food supply chains |

### 10.6 Summary of Research Foundation

| Paper | Key Contribution | Our Adoption | Our Simplification |
|-------|-----------------|--------------|-------------------|
| Paper 1 | Integrated decision support | Forecasting + recommendations | No tariff modeling |
| Paper 2 | Multi-scale forecasting | Demand forecasting core | ARIMA/XGBoost instead of Mamba |
| Paper 3 | Forecast-inventory linkage | Forecast to inventory analysis | Rules instead of deep optimization |
| Paper 4 | Explainable AI | SHAP feature importance | Supply-chain context vs. transport |
| Paper 5 | RAG for supply chains | Document-grounded answers | Government docs vs. electronics |
