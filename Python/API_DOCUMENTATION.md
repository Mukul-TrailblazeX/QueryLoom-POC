# API Documentation

This API powers a Multi-Tenant Hybrid RAG (Retrieval-Augmented Generation) backend. It allows external applications to upload documents (PDFs, Images) bounded to specific users, wait for AI processing, and query against that data intelligently.

**Base URL Parameter**: `http://127.0.0.1:8000/api/v1`

**Interactive Web View (Swagger UI)**: `http://127.0.0.1:8000/docs`
This interface is automatically generated and allows you to test endpoints directly from the browser.

---

## Authentication Mechanism
Currently, authentication is handled via HTTP Headers.
> **All Endpoints Require:**  
> `x-user-id`: string (Identifies the user making the request for data ownership mapping).

*Note: For testing purposes on upload routes, `test_user_123` is currently hardcoded into the `insert_document` database block during the POC phase. The `POST /query` route correctly enforces the header dynamically.*

---

## 1. 📄 Upload PDF Document
Uploads one or more PDF files securely. The system immediately registers the document and begins parallel AI Graph/Vector processing in the background.

- **Endpoint**: `/documents/pdf`
- **Method**: `POST`
- **Body Profile**: `multipart/form-data`

### Request Form Fields
| Key | Type | Description |
| :--- | :--- | :--- |
| `files` | File Array | Valid `.pdf` files. Can upload multiple files simultaneously. |

### Success Response (200 OK)
```json
{
  "message": "1 PDFs uploaded successfully",
  "documents": [
    {
      "document_id": "a940a241-d3a2-4624-8238-054497fd6a62",
      "filename": "annual_report.pdf",
      "status": "processing"
    }
  ]
}
```

---

## 2. 🌄 Upload Image Intelligence
Uploads one or more images (JPG/PNG). Executes Google Vision OCR combined with Gemini Vision summarization before mapping the text into the Vector and Graph engines.

- **Endpoint**: `/documents/image`
- **Method**: `POST`
- **Body Profile**: `multipart/form-data`

### Request Form Fields
| Key | Type | Description |
| :--- | :--- | :--- |
| `files` | File Array | Valid image (`.jpg`, `.png`, `.webp`, etc.). Can upload multiple files simultaneously. |

### Success Response (200 OK)
```json
{
  "message": "1 images uploaded successfully",
  "documents": [
    {
      "document_id": "8b3410fa-0ae4-45ed-b186-02cce2a5f1cc",
      "filename": "receipt_04.jpg",
      "status": "processing"
    }
  ]
}
```

---

## 3. 📝 Upload Text Document
Uploads one or more raw text files (`.txt`, `.md`, `.csv`). The system maps the text into the Vector and Graph engines.

- **Endpoint**: `/documents/text`
- **Method**: `POST`
- **Body Profile**: `multipart/form-data`

### Request Form Fields
| Key | Type | Description |
| :--- | :--- | :--- |
| `files` | File Array | Valid text files. Can upload multiple files simultaneously. |

### Success Response (200 OK)
```json
{
  "message": "1 text files uploaded successfully",
  "documents": [
    {
      "document_id": "c1490241-d3a2-4624-8238-054217fd6a62",
      "filename": "meeting_notes.txt",
      "status": "processing"
    }
  ]
}
```

---

## 4. 🎵 Upload Audio Document
Uploads audio files (`.mp3`, `.wav`) bounded to specific users. Uses OpenAI Whisper (with a self-contained FFmpeg binary install) to transcribe speech into text, and incorporates it into the AI Graph/Vector processing pipeline.

- **Endpoint**: `/documents/audio`
- **Method**: `POST`
- **Body Profile**: `multipart/form-data`

### Request Form Fields
| Key | Type | Description |
| :--- | :--- | :--- |
| `files` | File Array | Valid `.mp3`, `.wav` files. Can upload multiple files simultaneously. |

### Success Response (200 OK)
```json
{
  "message": "1 audio files uploaded successfully",
  "documents": [
    {
      "document_id": "ab70a241-d3a2-4624-8238-054497fd6a32",
      "filename": "interview_recording.mp3",
      "status": "processing"
    }
  ]
}
```

---

## 5. 🧠 Hybrid Query Engine
Executes a highly secured AI query against the user's uploaded documents. Evaluates both the Graph Database and the Vector Database mathematically.

- **Endpoint**: `/query`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `x-user-id`: `<AUTHORIZATION_USER_ID>`

### Request Body (JSON)
| Object Key | Type | Description |
| :--- | :--- | :--- |
| `query` | string | **[Required]** The question or command posed to the AI. |
| `document_ids` | array[string] | **[Optional]** If left empty `[]` or omitted, the AI queries against ALL files the user owns. If provided `["doc-uuid-string"]`, the query searches ONLY against that single file. |

**Example Request:**
```json
{
    "query": "When did the new forms become mandatory?",
    "document_ids": []
}
```

### Success Response (200 OK)
Returns the AI-synthesized answer alongside raw retrieval data transparency.
```json
{
    "answer": "The new environmental sample collection forms became mandatory on December 16, 2015.",
    "sources": {
        "chunks": [
            {
                "document_id": "a940a241...",
                "chunk_id": 5,
                "text": "Please begin using the new forms December 16, 2015.",
                "distance": 0.597
            }
        ],
        "relations": [
            {
                "relation": "REQUIRE",
                "source_id": "form",
                "source_label": "Concept",
                "target_id": "information",
                "target_label": "Concept"
            }
        ]
    },
    "latency_ms": 6130.45
}
```

### Common Error Responses
- **401 Unauthorized**: Missing `x-user-id` header.
- **404 Not Found**: You requested `document_ids` that this specific `x-user-id` does not actually own.
- **503 Unavailable**: (Within the JSON body) The underlying Google API or OpenRouter service is overloaded and timed out. You should retry the request.
