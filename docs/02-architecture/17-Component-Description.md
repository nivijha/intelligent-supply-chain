# Component Description

---

## 15. Architecture Components

### A. Official Government Data Sources

- **What it is:** FCI procurement reports, DFPD allocation data, state warehouse records, government circulars
- **Why we need it:** Provides reliable, official data as the foundation for analysis
- **What it receives:** Raw data in various formats (PDF, CSV, web pages)
- **What it produces:** Structured data ready for ingestion
- **Technology:** Web portals, PDF documents, CSV downloads
- **Alternative considered:** Synthetic data generation
- **Why sufficient:** Official data provides authenticity and real-world patterns

### B. Data Ingestion

- **What it is:** Process of collecting and loading data into the system pipeline
- **Why we need it:** Transforms raw government data into system-usable format
- **What it receives:** Raw data files from government sources
- **What it produces:** Structured datasets ready for cleaning
- **Technology:** Python scripts, pandas
- **Alternative considered:** Manual data entry
- **Why sufficient:** Automated ingestion handles repeated data collection efficiently

### C. Data Cleaning

- **What it is:** Handling missing values, normalizing formats, removing duplicates
- **Why we need it:** Data quality directly affects model performance
- **What it receives:** Raw ingested data with potential quality issues
- **What it produces:** Clean, consistent datasets ready for feature engineering
- **Technology:** pandas, NumPy
- **Alternative considered:** Manual data correction
- **Why sufficient:** Automated cleaning handles systematic quality issues

### D. Feature Engineering

- **What it is:** Creating derived features (lag features, seasonal indicators, rolling statistics)
- **Why we need it:** Enhances model predictive power by encoding domain knowledge
- **What it receives:** Clean historical demand data
- **What it produces:** Feature-rich datasets for ML models
- **Technology:** pandas, NumPy, custom feature functions
- **Alternative considered:** Using raw data directly
- **Why sufficient:** Feature engineering improves model accuracy without complex preprocessing

### E. PostgreSQL

- **What it is:** Relational database management system for operational data
- **Why we need it:** Stores commodities, warehouses, inventory, forecasts with ACID compliance
- **What it receives:** Structured data from ingestion pipeline, API requests
- **What it produces:** Queried data for ML service, dashboard, and recommendations
- **Technology:** PostgreSQL 15+
- **Alternative considered:** MySQL, MongoDB
- **Why sufficient:** Relational model fits structured supply-chain data

### F. Node.js

- **What it is:** JavaScript runtime environment for the backend server
- **Why we need it:** Enables JavaScript full-stack development, efficient I/O for REST APIs
- **What it receives:** HTTP requests from React frontend, database queries
- **What it produces:** JSON responses to frontend, forwarded requests to ML service
- **Technology:** Node.js 18+
- **Alternative considered:** Python Flask/Django backend
- **Why sufficient:** JavaScript ecosystem, NPM packages, efficient for API routing
