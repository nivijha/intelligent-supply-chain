# Why Not Kafka

---

## 28. Why Not Kafka

### Context

Kafka is useful for large-scale asynchronous event streaming, but the current project does not require high-throughput distributed event processing.

### Reasons

1. **Workload:** REST APIs and direct service communication are sufficient for the current workload pattern
2. **Complexity:** Kafka introduces operational complexity (cluster management, topic design, consumer groups) without significant benefit for prototype scale
3. **Team Size:** Three-member student team does not have capacity to manage Kafka infrastructure
4. **Scale:** 10-50 concurrent users do not require event streaming architecture
5. **Development Time:** Kafka adds weeks of setup and configuration time

### When Kafka Would Be Needed

- Real-time event ingestion from IoT sensors
- Multiple upstream data sources requiring asynchronous processing
- High-throughput data streams (>10,000 events/second)
- Distributed system with multiple producers and consumers

### Conclusion

Kafka is listed as future scope if the system evolves into a large distributed platform with real-time event ingestion requirements.
