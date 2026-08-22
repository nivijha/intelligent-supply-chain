# RAG Architecture

---

## 22. RAG

### 22.1 Purpose

Knowledge assistant answering questions from official government documents.

### 22.2 Pipeline

Documents -> Parsing -> Chunking -> Embedding -> Vector Store -> Query -> Retrieval -> LLM -> Answer

### 22.3 Document Sources

- National Food Security Act
- FCI Guidelines
- DFPD Circulars
- State Warehousing Rules

### 22.4 Chunking

- Chunk size: 500-1000 tokens
- Overlap: 50-100 tokens
- Metadata: Document title, section, page

### 22.5 Retrieval

- Cosine similarity
- Top 3-5 chunks
- Minimum similarity threshold

### 22.6 Limitations

- Quality depends on document coverage
- LLM may still hallucinate
- Regional language support needed
