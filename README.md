# Intelligent Supply Chain and Logistics Decision Support Platform

*Documentation-only repository — source code under active development.*

A machine learning and RAG-based decision support system for India's public food supply chain, integrating demand forecasting, inventory analysis, rule-based recommendations with SHAP explainability, and a knowledge-grounded RAG assistant for official government documents.

## Project Status

**Current**: Documentation phase only. This repository contains the full project documentation (design, architecture, implementation plan, testing strategy, and academic components) for an academic final-year project.

**Upcoming**: Source code implementation including:
- PostgreSQL database schema and migrations
- Node.js + Express backend with JWT auth and RBAC
- Python FastAPI ML service (XGBoost, Prophet, SHAP)
- React frontend dashboard (8 pages)
- RAG pipeline with vector store integration
- CI/CD pipeline (GitHub Actions)
- Deployment configurations

## Project Overview

This academic final-year project addresses the fragmentation in India's public food supply chain systems by providing an integrated platform for:

- **ML-based demand forecasting** using ARIMA (baseline) and XGBoost models
- **Inventory and warehouse analysis** to identify stock risks
- **Rule-based recommendation engine** with SHAP feature importance explanations
- **RAG assistant** for knowledge-grounded answers from official reports and policies
- **Role-based access control** with JWT authentication
- **Human-in-the-loop design** ensuring all recommendations require human validation

## Architecture

The system follows a modular separation:

- **Frontend**: React dashboard with 8-page interface
- **Backend**: Node.js + Express API with JWT authentication and RBAC
- **ML Service**: Python FastAPI with XGBoost, Prophet, and SHAP integration
- **Database**: PostgreSQL with structured schema
- **Vector Store**: For RAG pipeline supporting document retrieval
- **Authentication**: JWT-based with role-based access control (Admin, Planner, Warehouse Manager, Analyst)

## Technology Stack

- **Frontend**: React, HTML/CSS
- **Backend**: Node.js, Express.js
- **ML & AI**: Python, FastAPI, XGBoost, Prophet, SHAP
- **Database**: PostgreSQL
- **RAG**: Vector store integration for knowledge-grounded responses
- **Authentication**: JWT

## Core Features

| Feature | Description |
|---------|-------------|
| Demand Forecasting | ARIMA and XGBoost models trained on Indian government demand data |
| Inventory Analysis | Current stock levels analyzed against forecasted demand |
| Rule-based Recommendations | Replenishment, stock transfer, and capacity adjustment suggestions |
| SHAP Explainability | Feature importance explanations for all ML predictions |
| RAG Assistant | Answers grounded in official government documents and policies |
| RBAC | Four user roles with granular permissions |
| Human-in-the-Loop | All recommendations require human validation |

## Documentation Structure

- `docs/01-overview/` - Project overview, abstract, introduction, problem statement
- `docs/02-architecture/` - System architecture diagram, technology rationale, architecture layers
- `docs/03-implementation/` - MVP scope, deployment architecture, CI/CD pipeline
- `docs/04-evaluation/` - Testing strategy, unit/integration/API tests
- `docs/05-academic/` - Writing style guide, viva questions, research contribution
- `docs/06-metadata/` - Glossary, references, team distribution
- `docs/diagrams/` - Eraser and draw.io visual diagrams

## Development

This project documents the full software development lifecycle from problem definition through deployment. The actual source code implementation will be added to this repository upon completion of the documentation phase.

## License

MIT