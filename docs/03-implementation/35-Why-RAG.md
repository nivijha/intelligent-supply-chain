# Why RAG

---

## 30. Why RAG

### Context

RAG is not being used to replace ML. Its purpose is to provide grounded access to official documents.

### Three Components

| Component | Purpose | Example |
|-----------|---------|---------|
| ML | "What is likely to happen?" | Demand forecast: 52,000 tonnes |
| Recommendation Engine | "What action could be considered?" | Replenishment recommended |
| RAG | "What does the official documentation say?" | NFSA Section 3: Buffer stock provisions |

### Why RAG Adds Value

1. **Knowledge Access:** Official policies and guidelines are not captured in operational data
2. **Context:** Decision-makers need to understand policy constraints
3. **Verification:** Users can verify if recommendations align with official guidelines
4. **Updates:** New documents can be added without retraining models
5. **Transparency:** Source citations ensure answers are grounded in official sources

### RAG vs. Other Approaches

| Approach | Limitation |
|----------|-----------|
| Standalone LLM | May hallucinate, no source grounding |
| Fine-tuned LLM | Expensive, may forget general knowledge |
| Keyword search | No natural language understanding |
| RAG | Requires document collection and embedding |

### Conclusion

RAG provides a knowledge layer that ML predictions and rule-based recommendations cannot capture. It helps decision-makers understand the policy context governing supply-chain operations.
