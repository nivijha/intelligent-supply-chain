# Viva Questions

---

## 46. Viva Questions (50+)

### Project Overview

1. **Why did you choose this project?**
   Supply chains are critical for public welfare, and ML can improve decision-making.

2. **Why this problem over others?**
   It covers the full ML lifecycle: forecasting, analysis, recommendations, explainability.

3. **Why government data?**
   Publicly available, reliable, and has social impact.

4. **What is the difference between monitoring and decision-support?**
   Monitoring displays data; decision-support provides actionable insights.

### Technology Choices

5. **Why PostgreSQL?**
   Relational model fits structured supply-chain data; ACID compliance.

6. **Why Node.js?**
   JavaScript full-stack, efficient for REST APIs.

7. **Why Python + FastAPI?**
   Python has the best ML ecosystem; FastAPI provides automatic docs.

8. **Why XGBoost?**
   Handles tabular data well, easier to explain than deep learning.

9. **Why not Mamba/LSTM?**
   Require more data, GPU resources; simpler models sufficient for prototype.

10. **Why rule-based recommendations?**
    Interpretable, easy to validate, auditable.

11. **Why RAG?**
    Grounds answers in official documents, reduces hallucination.

12. **Why SHAP?**
    Theoretically grounded, consistent feature importance.

13. **Why JWT?**
    Stateless, works across services, standard for REST APIs.

14. **Why RBAC?**
    Simple role hierarchy matches project requirements.

15. **Why not Kafka?**
    REST APIs sufficient for current workload.

16. **Why not microservices?**
    Modular monolith appropriate for 3-student team.

### Architecture

17. **How does data flow through the system?**
    Data Sources -> Ingestion -> PostgreSQL -> Backend -> ML -> Dashboard -> User.

18. **How do services communicate?**
    REST APIs via HTTP.

19. **How is authentication implemented?**
    JWT tokens with role-based middleware.

20. **How does the ML service communicate with the backend?**
    FastAPI REST endpoints called by Node.js.

### Machine Learning

21. **How is the model trained?**
    Offline using historical data with chronological split.

22. **How is the model evaluated?**
    MAE, RMSE, MAPE on test set.

23. **How often is the model retrained?**
    Periodically (every 6 months or when MAE exceeds threshold).

24. **What happens if the forecast is wrong?**
    Recommendations may be inaccurate; human validation is required.

25. **How are recommendations validated?**
    Rule validation against known scenarios.

26. **How does SHAP explain predictions?**
    Feature contributions sum to prediction difference from baseline.

### RAG

27. **How does RAG avoid hallucination?**
    Answers grounded in retrieved documents with source citations.

28. **What documents are used?**
    Official government reports, policies, circulars.

29. **How are documents processed?**
    Parsed, chunked, embedded, stored in vector database.

30. **How does retrieval work?**
    Cosine similarity between query and document embeddings.

### System Design

31. **What are the main tables?**
    User, Role, Commodity, Warehouse, Inventory, HistoricalDemand, Forecast, Recommendation.

32. **What is the role hierarchy?**
    ADMIN > PLANNER > WAREHOUSE_MANAGER > ANALYST.

33. **What happens if the database is down?**
    API returns 500 error; system degrades gracefully.

34. **How is the system deployed?**
    Docker containers on Render/AWS; frontend on Vercel.

35. **How is CI/CD configured?**
    GitHub Actions: test, lint, build, deploy.

### Limitations

36. **What are the limitations?**
    Data quality, simplified rules, prototype scale, no real deployment.

37. **What would you do differently?**
    More data, advanced models, optimization engine, mobile app.

38. **What is future scope?**
    Kafka, IoT, reinforcement learning, digital twin, cloud scaling.

39. **Is this production-ready?**
    No, it is a prototype for demonstration and evaluation.

40. **How does this compare to commercial solutions?**
    Commercial solutions are expensive and not PDS-specific.

### Research

41. **What is the research gap?**
    Integration of forecasting, analysis, explainability, and RAG.

42. **What is the novelty?**
    Domain adaptation for Indian public food supply chains.

43. **What papers did you review?**
    5 papers on decision-support, forecasting, inventory, explainability, RAG.

44. **How do your results compare to baselines?**
    [TO BE EVALUATED] after experiments.

45. **What metrics do you use?**
    MAE, RMSE, MAPE for forecasting; manual evaluation for RAG.

### Practical Questions

46. **How do you handle missing data?**
    Forward fill or interpolation during preprocessing.

47. **How do you handle new commodities?**
    Add to database, train model on historical data.

48. **How do you handle new users?**
    Admin creates user, assigns role.

49. **How do you handle system failures?**
    Graceful degradation, error logging, user notification.

50. **How would you scale this system?**
    Microservices, Kafka, Kubernetes, cloud deployment.

51. **What testing did you do?**
    Unit, integration, API, ML, RAG, end-to-end.

52. **What security measures are implemented?**
    Password hashing, JWT, RBAC, input validation, CORS.

53. **How do you ensure data quality?**
    Validation, cleaning pipeline, quality checks.

54. **What is the deployment architecture?**
    Docker containers, managed PostgreSQL, Vercel frontend.

55. **How do you monitor the system?**
    Application logs, error logs, API response time tracking.
