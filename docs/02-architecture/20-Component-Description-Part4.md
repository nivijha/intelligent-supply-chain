# Component Description (Part 4)

---

## 15. Architecture Components (Part 4)

### S. Vector Store

- **What it is:** Database storing document embeddings for similarity search
- **Why we need it:** Enables efficient retrieval of relevant document chunks
- **What it receives:** Document embeddings (from chunked documents), query embeddings
- **What it produces:** Top-k similar document chunks for a given query
- **Technology:** FAISS or ChromaDB
- **Alternative considered:** Elasticsearch, relational DB with pgvector
- **Why sufficient:** Specialized for embedding similarity search, simple to set up

### T. LLM

- **What it is:** Large Language Model for generating answers from retrieved context
- **Why we need it:** Synthesizes retrieved document chunks into coherent answers
- **What it receives:** Retrieved document chunks + user query
- **What it produces:** Natural language answer with source citations
- **Technology:** OpenAI API or open-source LLM (e.g., Llama, Mistral)
- **Alternative considered:** Template-based answer generation
- **Why sufficient:** LLMs provide natural language understanding and generation

### U. React Dashboard

- **What it is:** Web-based user interface for interacting with the system
- **Why we need it:** Provides accessible interface for all user roles
- **What it receives:** API responses from Node.js backend
- **What it produces:** Visualizations, forms, alerts, recommendation cards
- **Technology:** React, Chart.js/Recharts, Tailwind CSS
- **Alternative considered:** Vue.js, Angular, plain HTML
- **Why sufficient:** React ecosystem, component reusability, Vercel deployment

### V. Human-in-the-Loop Decision Process

- **What it is:** Framework ensuring final decisions remain with human users
- **Why we need it:** Supply-chain decisions require human judgment and accountability
- **What it receives:** Recommendations, explanations, RAG answers from the system
- **What it produces:** Human-validated operational decisions (accept, reject, modify)
- **Technology:** Dashboard UI with accept/reject buttons, decision logging
- **Alternative considered:** Automated decision execution
- **Why sufficient:** Human oversight ensures accountability and ground-reality validation
