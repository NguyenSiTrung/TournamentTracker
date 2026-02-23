# Python Style Guide

## General
- Follow PEP 8
- Python 3.10+ (use modern syntax: `match`, type unions with `|`)
- 4-space indentation, 88-char line limit (Black formatter compatible)

## Naming
- `snake_case` for functions, variables, modules
- `PascalCase` for classes and Pydantic models
- `UPPER_SNAKE_CASE` for constants
- Prefix private functions/methods with `_`

## FastAPI Conventions
- Group routes by resource in separate router files
- Use Pydantic models for request/response schemas
- Use dependency injection for database sessions
- Use `HTTPException` for error responses with appropriate status codes
- Type-annotate all function parameters and return values

## Project Structure (Planned)
```
backend/
├── main.py          # FastAPI app entry point
├── routers/         # Route handlers by resource
├── models/          # Pydantic schemas
├── database/        # DB connection and ORM models
└── requirements.txt
```

## Testing
- Use `pytest` with `httpx.AsyncClient` for API tests
- Test files mirror source structure with `test_` prefix
