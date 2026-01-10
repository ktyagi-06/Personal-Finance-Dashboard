from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import openai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("MODEL", "gpt-4o")

class ChatRequest(BaseModel):
    message: str
    transactions: List[dict] = []
    history: Optional[List[dict]] = None

@app.get("/health")
def health():
    return {"status": "AI service running"}

@app.post("/chat")
async def chat(request: ChatRequest):

    # Build financial context for the AI
    expenses = [t for t in request.transactions if t.get("type") == "expense"]
    income = [t for t in request.transactions if t.get("type") == "income"]

    total_expense = sum(t.get("amount", 0) for t in expenses)
    total_income = sum(t.get("amount", 0) for t in income)
    
    financial_context = (
        f"User Income: {total_income} | User Expense: {total_expense} | "
        f"Transactions: {len(request.transactions)} entries"
    )

    # Create conversation for GPT
    chat_history = [{"role": "system", "content": 
        "You are a financial advisor AI. Be friendly, useful, and explain clearly. "
        "Give budgeting tips, savings suggestions, investment ideas, and spending insights based on user data."
    }]

    if request.history:
        chat_history.extend(request.history)

    chat_history.append({"role": "user", "content": request.message})
    chat_history.append({"role": "system", "content": f"[FINANCIAL CONTEXT: {financial_context}]"})

    if not openai.api_key:
        return {"reply": "⚠ AI model unavailable (missing API key)"}

    # Talk to GPT-4o
    completion = openai.chat.completions.create(
        model=MODEL,
        messages=chat_history,
        temperature=0.7
    )

    reply = completion.choices[0].message.content

    return {
        "reply": reply,
        "summary": {
            "total_income": total_income,
            "total_expense": total_expense
        }
    }
