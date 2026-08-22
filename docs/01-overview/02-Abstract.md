# Abstract

---

## Intelligent Supply Chain and Logistics Decision Support Platform Using Machine Learning and RAG

---

### Abstract

Effective supply-chain management is critical for ensuring timely availability of essential commodities, particularly in public-sector food distribution systems. Traditional supply-chain systems provide operational visibility through dashboards and reporting but lack the ability to integrate demand forecasting, inventory analysis, warehouse utilization, and knowledge from official government documents into a single explainable decision-support workflow.

This project proposes an AI-assisted decision-support platform that combines machine learning-based demand forecasting, inventory and warehouse analysis, rule-based recommendation generation, SHAP-based explainability, and a retrieval-augmented generation (RAG) assistant grounded in official government documents. The platform uses historical demand data from official Indian government sources to forecast future demand using ARIMA (baseline) and XGBoost models. Current inventory levels, warehouse capacities, and safety stock thresholds are analyzed against forecasted demand to identify stock risks and generate operational recommendations. A rule-based recommendation engine translates predictions into actionable suggestions such as replenishment, stock transfer, or capacity adjustment, with each recommendation accompanied by SHAP feature importance explanations for transparency. A focused RAG service provides knowledge-grounded answers from official government reports, policies, and circulars.

The system follows a modular architecture with a React frontend, Node.js and Express backend, PostgreSQL database, and Python FastAPI ML service. Role-based access control with JWT authentication ensures secure access for administrators, planners, warehouse managers, and analysts. The platform is designed as a prototype decision-support tool for the Indian public food supply-chain context, supporting human-in-the-loop decision-making rather than autonomous operations.

**Keywords:** Supply Chain, Demand Forecasting, Decision Support, Explainable AI, RAG, Machine Learning, Food Distribution, India
