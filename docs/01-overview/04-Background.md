# Background

---

## 2. Background

### 2.1 Indian Public Food Supply Chain

India operates one of the world's largest public food distribution systems. Key organizations include:

| Organization | Role |
|-------------|------|
| Food Corporation of India (FCI) | Procurement, storage, and distribution of food grains |
| Department of Food and Public Distribution (DFPD) | Policy formulation and oversight |
| State Food and Civil Supplies Departments | State-level distribution management |
| Central Warehousing Corporation (CWC) | Storage infrastructure |
| State Warehousing Corporations (SWC) | State-level storage |

The Public Distribution System (PDS) distributes subsidized food grains to approximately 800 million beneficiaries through approximately 500,000 Fair Price Shops across India.

### 2.2 Supply-Chain Operations

The supply chain involves:

1. **Procurement:** Government procures commodities from farmers at Minimum Support Price (MSP)
2. **Storage:** Procured commodities stored in FCI/CWC/SWC warehouses
3. **Allocation:** Central government allocates commodities to states based on population and poverty data
4. **Transportation:** Goods moved from central/state warehouses to district and block-level warehouses
5. **Distribution:** Fair Price Shops distribute to beneficiaries

### 2.3 Existing Systems and Tools

Current systems include:

- **FCI's Warehouse Management System:** Tracks inventory levels at FCI warehouses
- **EPDS (Electronic Public Distribution System):** Ration card management and beneficiary identification
- **Aadhaar-enabled PoS:** Biometric authentication at Fair Price Shops
- **State-level dashboards:** Individual state monitoring portals

These systems provide operational visibility but do not integrate forecasting, recommendations, and explainability into a unified workflow.

### 2.4 Data Availability

Government data sources include:

- FCI monthly procurement reports
- DFPD allocation data
- State-wise distribution statistics
- Warehouse capacity and utilization reports
- Historical consumption patterns

Data is available in various formats (PDF reports, CSV downloads, government portals) and requires preprocessing for analytical use.

### 2.5 Supply-Chain Analytics in Literature

Supply-chain analytics encompasses:

- **Descriptive analytics:** What happened? (historical reports, dashboards)
- **Diagnostic analytics:** Why did it happen? (root cause analysis)
- **Predictive analytics:** What will happen? (demand forecasting)
- **Prescriptive analytics:** What should we do? (recommendation systems)

Most existing public-sector systems focus on descriptive analytics. This project addresses the predictive and prescriptive dimensions.

### 2.6 Machine Learning in Supply Chains

ML applications in supply chains include:

- Demand forecasting using time-series models
- Inventory optimization using optimization algorithms
- Anomaly detection for identifying unusual consumption patterns
- Classification for risk assessment

Common approaches range from statistical methods (ARIMA, exponential smoothing) to machine learning (XGBoost, Random Forest) to deep learning (LSTM, Transformer). For a student prototype, simpler models provide sufficient accuracy with easier explainability.

### 2.7 Explainable AI in Supply Chains

Explainable AI techniques include:

- **SHAP (SHapley Additive exPlanations):** Game-theoretic approach to feature importance
- **LIME (Local Interpretable Model-agnostic Explanations):** Local approximations
- **Attention mechanisms:** In deep learning models
- **Decision trees:** Inherently interpretable models

SHAP provides consistent, theoretically grounded feature importance suitable for supply-chain decision support where transparency is essential.

### 2.8 Retrieval-Augmented Generation (RAG)

RAG combines retrieval from external documents with language model generation:

- Documents are chunked, embedded, and stored in a vector database
- User queries trigger similarity search to retrieve relevant chunks
- Retrieved context is combined with the query for the language model
- The model generates grounded answers with source citations

RAG reduces hallucination compared to standalone language models and ensures answers are grounded in official documentation.
