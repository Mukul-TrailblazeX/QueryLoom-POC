# 🚀 RAG-Based Knowledge Chat Tool (7-Day PoC)

A full-stack **Retrieval-Augmented Generation (RAG)** powered chatbot that delivers accurate, context-aware responses using semantic search and Large Language Models.

Built as a **7-day Proof of Concept (PoC)** with complete frontend, backend, and AI pipeline integration.

---

## 📌 Features

- 💬 Interactive chat interface  
- 🔍 Semantic search using vector embeddings  
- 🧠 Context-aware AI responses (RAG pipeline)  
- ⚡ FastAPI backend for scalable APIs  
- 🌐 React frontend for smooth user experience  
- 🗂️ Vector database for efficient retrieval  
- 🚀 End-to-end integration  

---

## 🏗️ Architecture Overview

1. User sends query via frontend  
2. Backend processes request  
3. Query is converted into embeddings  
4. Vector DB retrieves relevant context  
5. Context is combined with query  
6. LLM generates final response  
7. Response displayed to user  

---

## 👥 Team & Responsibilities

- **Mukul (Backend)** – APIs, database, caching, deployment  
- **Mehul (AI)** – RAG pipeline, embeddings, vector DB, LLM  
- **Mehar (Frontend)** – UI, chat interface, API integration  

---

## 🛠️ Tech Stack

**Frontend**
- React.js  
- Axios / Fetch API  

**Backend**
- FastAPI  
- Python  

**AI / RAG**
- Sentence Transformers / OpenAI Embeddings  
- FAISS / Pinecone  
- LLM (OpenAI / LLaMA)  

**Database & Caching**
- PostgreSQL  
- Redis  

---

## 📅 7-Day Execution Plan

| Day | Focus |
|-----|------|
| Day 1 | Project setup (Frontend, Backend, AI environment) |
| Day 2 | API creation + UI + preprocessing |
| Day 3 | Database + embeddings + integration |
| Day 4 | Auth + retrieval + UI improvements |
| Day 5 | LLM integration + response formatting |
| Day 6 | Testing + tuning + bug fixes |
| Day 7 | Deployment + final polish |

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/rag-chatbot.git
cd rag-chatbot

2. Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
3. Frontend Setup
cd frontend
npm install
npm start
4. Environment Variables

Create a .env file in the backend directory:

OPENAI_API_KEY=your_api_key
VECTOR_DB_KEY=your_vector_db_key
DATABASE_URL=your_database_url
🔄 RAG Pipeline Workflow
User Query
Text Preprocessing
Embedding Generation
Vector Search
Context Retrieval
LLM Response Generation
Response Display
🎯 Goal

Deliver a fully functional end-to-end RAG chatbot in 7 days, including:

Working frontend
Backend APIs
AI-powered response system
⚠️ Important Notes
This project is a Proof of Concept (PoC)
Focus is on functionality over perfection
Uses external APIs/models for rapid development
🚀 Future Improvements
Advanced authentication system
Improved UI/UX
Streaming responses
Multi-document ingestion
Model fine-tuning
Scalable deployment (Docker, Kubernetes)
📄 License

This project is for educational and demonstration purposes.

