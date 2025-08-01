from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import base64
import io
from typing import Optional, Dict, Any, List
import re
from datetime import datetime

app = FastAPI(
    title="Auto-HR LLM Service",
    description="FastAPI service for LLM integration in Auto-HR system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LLMRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None
    model: Optional[str] = "default"

class LLMResponse(BaseModel):
    response: str
    model_used: str
    tokens_used: Optional[int] = None

class PDFExtractRequest(BaseModel):
    pdf_data: str  # Base64 encoded PDF data

class PDFExtractResponse(BaseModel):
    text: str
    success: bool

class MetadataExtractRequest(BaseModel):
    content: str

class MetadataExtractResponse(BaseModel):
    metadata: Dict[str, Any]
    success: bool

class ResumeData(BaseModel):
    id: str
    filename: str
    content: str
    metadata: Dict[str, Any]
    vectorId: Optional[str] = None
    createdAt: datetime

class VectorStoreRequest(BaseModel):
    content: str
    metadata: Dict[str, Any]
    resumeId: str

class VectorStoreResponse(BaseModel):
    vectorId: str
    success: bool

# In-memory storage for demo purposes
resumes_db = []
vectors_db = []

@app.get("/")
async def root():
    return {"message": "Auto-HR LLM Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "llm"}

@app.post("/generate", response_model=LLMResponse)
async def generate_response(request: LLMRequest):
    """
    Generate LLM response based on the provided prompt
    """
    try:
        # TODO: Implement actual LLM integration
        # This is a placeholder response
        response = f"Generated response for: {request.prompt}"
        
        return LLMResponse(
            response=response,
            model_used=request.model or "default",
            tokens_used=len(request.prompt.split())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-pdf-text", response_model=PDFExtractResponse)
async def extract_pdf_text(request: PDFExtractRequest):
    """
    Extract text content from PDF data
    """
    try:
        # Decode base64 PDF data
        pdf_bytes = base64.b64decode(request.pdf_data)
        
        # TODO: Implement actual PDF text extraction
        # For now, return a placeholder text
        # In production, you would use libraries like PyPDF2, pdfplumber, or pdf2txt
        
        extracted_text = f"Extracted text from PDF (placeholder). Content length: {len(pdf_bytes)} bytes"
        
        return PDFExtractResponse(
            text=extracted_text,
            success=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")

@app.post("/extract-metadata", response_model=MetadataExtractResponse)
async def extract_metadata(request: MetadataExtractRequest):
    """
    Extract metadata from resume content
    """
    try:
        content = request.content
        
        # Extract basic metadata using regex patterns
        metadata = {}
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, content)
        if emails:
            metadata['email'] = emails[0]
        
        # Phone extraction
        phone_pattern = r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phones = re.findall(phone_pattern, content)
        if phones:
            metadata['phone'] = phones[0]
        
        # Name extraction (first line that looks like a name)
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        if lines:
            # Simple heuristic: first line with 2-4 words, no special chars
            for line in lines[:5]:  # Check first 5 lines
                words = line.split()
                if 2 <= len(words) <= 4 and all(word.isalpha() for word in words):
                    metadata['name'] = line
                    break
        
        # Skills extraction (look for common skill keywords)
        skill_keywords = [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'mongodb',
            'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership',
            'project management', 'data analysis', 'machine learning', 'ai'
        ]
        
        found_skills = []
        content_lower = content.lower()
        for skill in skill_keywords:
            if skill in content_lower:
                found_skills.append(skill)
        
        if found_skills:
            metadata['skills'] = found_skills
        
        # Title/Position extraction
        title_keywords = ['engineer', 'developer', 'manager', 'analyst', 'specialist', 'consultant']
        for keyword in title_keywords:
            if keyword in content_lower:
                metadata['title'] = keyword.title()
                break
        
        return MetadataExtractResponse(
            metadata=metadata,
            success=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract metadata: {str(e)}")

@app.post("/store-resume")
async def store_resume(resume_data: ResumeData):
    """
    Store resume data in MongoDB (simulated)
    """
    try:
        # TODO: Implement actual MongoDB storage
        # For now, store in memory
        resumes_db.append(resume_data.dict())
        
        return {
            "success": True,
            "message": "Resume stored successfully",
            "id": resume_data.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store resume: {str(e)}")

@app.post("/store-vector", response_model=VectorStoreResponse)
async def store_vector(request: VectorStoreRequest):
    """
    Store resume content as embeddings in Supabase Vector DB (simulated)
    """
    try:
        # TODO: Implement actual Supabase Vector DB storage
        # For now, generate a mock vector ID
        vector_id = f"vec_{len(vectors_db)}_{datetime.now().timestamp()}"
        
        vectors_db.append({
            "vectorId": vector_id,
            "content": request.content,
            "metadata": request.metadata,
            "resumeId": request.resumeId
        })
        
        return VectorStoreResponse(
            vectorId=vector_id,
            success=True
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store vector: {str(e)}")

@app.get("/resumes")
async def get_resumes():
    """
    Get all stored resumes
    """
    return {
        "resumes": resumes_db,
        "count": len(resumes_db)
    }

@app.get("/vectors")
async def get_vectors():
    """
    Get all stored vectors
    """
    return {
        "vectors": vectors_db,
        "count": len(vectors_db)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 