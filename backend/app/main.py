import base64
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .ai_service import create_conversion_plan
from .config import get_settings
from .exporters import create_preview, render_file
from .schemas import (
    ConversionRequest,
    ConversionResponse,
    OutputFormat,
)


logger = logging.getLogger(__name__)
settings = get_settings()

app = FastAPI(
    title="Office AI API",
    description="Convert unstructured text into polished downloadable files with Gemini.",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "gemini_configured": bool(settings.google_api_key),
        "model": settings.gemini_model,
    }


@app.get("/api/formats")
async def formats() -> list[str]:
    return [item.value for item in OutputFormat]


@app.post("/api/convert", response_model=ConversionResponse)
async def convert(request: ConversionRequest) -> ConversionResponse:
    if len(request.text) > settings.max_input_characters:
        raise HTTPException(
            status_code=413,
            detail=(
                f"Input is too long. Maximum size is "
                f"{settings.max_input_characters:,} characters."
            ),
        )

    try:
        plan = await create_conversion_plan(
            text=request.text,
            output_format=request.output_format,
            instructions=request.instructions,
            settings=settings,
        )
        content, filename, mime_type = render_file(plan, request.output_format)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Conversion failed")
        raise HTTPException(
            status_code=502,
            detail="Gemini could not structure this text. Please retry or simplify it.",
        ) from exc

    return ConversionResponse(
        filename=filename,
        mime_type=mime_type,
        file_base64=base64.b64encode(content).decode("ascii"),
        preview=create_preview(plan, request.output_format),
        title=plan.title,
        output_format=request.output_format,
    )
