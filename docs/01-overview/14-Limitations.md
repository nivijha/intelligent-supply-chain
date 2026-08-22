# Limitations

---

## 12. Limitations

### 12.1 Data Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Public datasets may not represent complete real-time operations | Forecast accuracy may be affected | Use best available official data; document data gaps |
| Some inventory/warehouse data may be unavailable | Inventory analysis may be incomplete | Use estimates where necessary; clearly state assumptions |
| Data may have inconsistencies across sources | Cleaning and normalization required | Thorough preprocessing pipeline; data quality checks |

### 12.2 Model Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Forecast accuracy depends on data quality | Predictions may have errors | Evaluate rigorously; provide confidence intervals |
| Simpler models may underperform complex ones | Forecast may not be optimal | Baseline comparison; document tradeoffs |
| Models trained on historical data may not capture structural breaks | Unprecedented events may cause forecast failure | Periodic retraining; human validation of recommendations |

### 12.3 System Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Rule-based recommendations are simplified | May not capture all operational nuances | Rules are interpretable and auditable; human override possible |
| RAG quality depends on document quality | Answers may be incomplete | Curate document collection; provide source citations |
| Prototype does not control physical logistics | No real-world execution | System is decision-support only; human-in-the-loop |
| Single-server deployment | Not scalable to enterprise load | Clearly documented as prototype; future scope for scaling |

### 12.4 Scope Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| Limited to selected commodities | Not comprehensive PDS coverage | Designed for extensibility; additional commodities can be added |
| Results may not generalize to every region | Findings are context-specific | Document regional variations; future work on generalization |
| Not tested in real government environment | Practical validity untested | Prototype validated in controlled environment; future deployment scope |

### 12.5 Honest Disclosure

These limitations are documented to:

- Provide accurate representation of the project's scope
- Guide future work and improvements
- Enable informed evaluation by reviewers and mentors
- Maintain academic integrity in reporting
