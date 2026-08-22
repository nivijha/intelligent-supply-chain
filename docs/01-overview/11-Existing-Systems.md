# Existing Systems

---

## 9. Existing Systems

### 9.1 Current Government Systems

| System | Organization | Function | Limitations |
|--------|-------------|----------|-------------|
| FCI Warehouse Management | FCI | Inventory tracking at FCI warehouses | No forecasting, no recommendations |
| EPDS | DFPD | Ration card management, beneficiary ID | Distribution tracking, not decision support |
| Aadhaar-enabled PoS | UIDAI/DFPD | Biometric authentication at FPS | Transaction recording only |
| State Dashboards | State Governments | State-level monitoring | Fragmented, no cross-state integration |
| APMCS Systems | State Marketing Boards | Procurement tracking | State-specific, limited analytics |

### 9.2 Commercial Supply-Chain Solutions

Commercial solutions exist (SAP SCM, Oracle SCM Cloud, Blue Yonder) but are:

- Expensive for public-sector deployment at scale
- Designed for private-sector logistics, not PDS-specific workflows
- Not customized for Indian food supply-chain regulations
- Require significant infrastructure investment

### 9.3 Academic Research Systems

Academic projects have addressed:

- Demand forecasting for specific commodities
- Warehouse location optimization
- Route optimization for distribution
- Individual ML models for supply-chain tasks

These typically focus on isolated components rather than integrated decision-support workflows.

### 9.4 Gap Analysis

| Capability | FCI Systems | Commercial SCM | Academic Projects | This Project |
|-----------|-------------|----------------|-------------------|--------------|
| Demand forecasting | No | Yes | Yes | Yes |
| Inventory analysis | Partial | Yes | Limited | Yes |
| Warehouse utilization | Partial | Yes | Limited | Yes |
| Rule-based recommendations | No | Yes | No | Yes |
| SHAP explainability | No | No | Limited | Yes |
| RAG for documents | No | No | No | Yes |
| Role-based access | Limited | Yes | No | Yes |
| Indian PDS context | Yes | No | Limited | Yes |

### 9.5 Contribution of This Project

The project contributes an integrated workflow combining:

- Forecasting + inventory analysis + recommendations + explainability + RAG

in a single prototype focused on the Indian public food supply-chain context, rather than addressing individual components in isolation.
