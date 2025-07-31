# auto-hr

## System Architecture

```
[Frontend: Next.js + Tailwind] <---> [Nest.js API Gateway]
|                                  |
[Lark Bot SDK]                      [FastAPI (LLM)]
|                                  |
[LangChain Agent] <--> [Supabase Vector DB] + [MongoDB]
```

## Folder Structure

- frontend/           # Next.js + Tailwind frontend
- api-gateway/        # Nest.js API Gateway
- lark-bot-sdk/       # Lark Bot SDK integration
- fastapi-llm/        # FastAPI for LLM
- langchain-agent/    # LangChain Agent
- supabase-vector-db/ # Supabase Vector DB integration
- mongodb/            # MongoDB related scripts/configs