# Why Not Microservices

---

## 29. Why Not Microservices

### Context

The current system uses modular separation rather than deploying every feature as an independent microservice.

### Reasons

1. **Operational Complexity:** Microservices introduce service discovery, inter-service communication, and distributed tracing
2. **No Benefit at Scale:** Single-server deployment sufficient for prototype (10-50 users)
3. **Development Speed:** Monolith allows faster development and debugging
4. **Team Size:** Three students cannot manage multiple independent services
5. **Deployment:** Single deployment unit simpler than orchestrating multiple services

### What We Do Instead

- Modular monolith with clear separation of concerns
- ML service separated because Python provides ML ecosystem needed
- Backend and frontend are independently deployable
- Clear API contracts between components

### When Microservices Would Be Needed

- Independent scaling of individual services
- Different teams owning different services
- Fault isolation requirements
- Technology diversity beyond ML (e.g., different languages per service)

### Conclusion

The modular monolith approach allows faster development and simpler debugging for a 3-student team while maintaining good software engineering practices.
