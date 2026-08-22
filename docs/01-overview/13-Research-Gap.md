# Research Gap

---

## 11. Research Gap and Novelty

### 11.1 Honest Assessment

This project does **not** claim:

- "No existing system has ever combined these techniques"
- "Our architecture is entirely novel"
- "We have invented new algorithms"
- "Our approach is superior to all alternatives"

### 11.2 What Exists in Literature

Individual techniques are well-established:

| Technique | Existing Research |
|-----------|------------------|
| Demand forecasting | Extensive literature on ARIMA, XGBoost, LSTM for demand prediction |
| Inventory optimization | Well-studied optimization models and heuristics |
| Explainable AI | SHAP, LIME, attention mechanisms widely researched |
| RAG | Growing body of work on document-grounded generation |
| Rule-based systems | Classical AI approach with long history |

### 11.3 Research Contribution

The contribution is the **integration and adaptation** of established techniques into a focused decision-support workflow for a specific context:

**"An explainable, data-driven decision-support workflow for the Indian public food supply-chain context that combines demand forecasting, inventory/warehouse analysis, transparent recommendation rules, and a knowledge-grounded RAG assistant using official government information."**

### 11.4 Dimensions of Novelty

| Dimension | Contribution |
|-----------|-------------|
| **Domain adaptation** | Applying ML techniques to Indian public-sector food supply chains |
| **Integration** | Combining forecasting, inventory, rules, explainability, and RAG into one workflow |
| **Explainability** | SHAP explanations tailored to supply-chain decision factors |
| **Government-data grounding** | RAG using official Indian government documents |
| **Human-in-the-loop** | Recommendations support rather than replace human decisions |

### 11.5 Distinction

- **Existing research:** Individual techniques and components (forecasting, explainability, RAG separately)
- **Our work:** Simplified integrated prototype focused on a specific Indian public-sector context

### 11.6 Value Proposition

The value lies in:

1. **Accessibility:** A student-implementable prototype demonstrating integrated capabilities
2. **Context-specificity:** Tailored to Indian food supply chains with official data
3. **Transparency:** Every prediction and recommendation is explainable
4. **Completeness:** End-to-end workflow from data ingestion to human decision
5. **Practicality:** Human-in-the-loop design suitable for government operations
