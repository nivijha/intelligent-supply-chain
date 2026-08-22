# Component Description (Continued)

---

## 15. Architecture Components (Continued)

### G. Express

- **What it is:** Minimal web framework for Node.js
- **Why we need it:** Provides routing, middleware, request handling without overhead
- **What it receives:** HTTP requests with routes, headers, bodies
- **What it produces:** Route handlers, middleware chains, response objects
- **Technology:** Express.js
- **Alternative considered:** Koa, Fastify
- **Why sufficient:** Mature framework with largest ecosystem and documentation

### H. JWT

- **What it is:** JSON Web Token for stateless authentication
- **Why we need it:** Enables secure API access without server-side session storage
- **What it receives:** User credentials at login, token in subsequent requests
- **What it produces:** Signed tokens for authenticated requests, decoded user info
- **Technology:** jsonwebtoken npm package
- **Alternative considered:** Session cookies, OAuth2
- **Why sufficient:** Stateless, works across services, standard for REST APIs

### I. RBAC

- **What it is:** Role-Based Access Control for authorization
- **Why we need it:** Ensures users only access data appropriate to their role
- **What it receives:** User role from JWT token, requested resource
- **What it produces:** Access decision (allow/deny) for each API endpoint
- **Technology:** Custom middleware with role-based permission maps
- **Alternative considered:** Attribute-based access control (ABAC)
- **Why sufficient:** Simple role hierarchy matches project requirements (4 roles)

### J. Python ML Service

- **What it is:** Dedicated Python service for machine learning operations
- **Why we need it:** Python provides the ML ecosystem required for forecasting and explainability
- **What it receives:** HTTP requests from Node.js backend with data and parameters
- **What it produces:** Forecast values, inventory analysis, recommendations, SHAP explanations
- **Technology:** Python 3.10+, FastAPI, uvicorn
- **Alternative considered:** ML embedded in Node.js via TensorFlow.js
- **Why sufficient:** Python ML ecosystem not available in Node.js

### K. FastAPI

- **What it is:** Modern Python web framework for APIs
- **Why we need it:** Automatic OpenAPI documentation, type validation, async support
- **What it receives:** HTTP requests with JSON payloads
- **What it produces:** JSON responses, auto-generated API documentation
- **Technology:** FastAPI with uvicorn server
- **Alternative considered:** Flask, Django REST Framework
- **Why sufficient:** Best developer experience for Python API development

### L. Demand Forecasting

- **What it is:** ML model predicting future demand for commodities
- **Why we need it:** Anticipates future requirements for proactive inventory planning
- **What it receives:** Historical demand data, engineered features, forecast horizon
- **What it produces:** Predicted demand values for future periods
- **Technology:** ARIMA/Prophet (baseline), XGBoost (ML model)
- **Alternative considered:** LSTM, Transformer models
- **Why sufficient:** Simpler models sufficient for prototype; easier to explain and debug
