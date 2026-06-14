from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from .config import Settings
from .schemas import ConversionPlan, OutputFormat


SYSTEM_PROMPT = """
You are an expert data editor and document formatter. Convert noisy, unstructured
source text into a faithful structured plan.

Rules:
- Never invent facts, values, prices, names, totals, or categories.
- Correct obvious spacing and formatting problems without changing meaning.
- Detect the natural records and fields in the source instead of forcing a fixed schema.
- Remove filler, repetition, greetings, and promotional prose from tabular output.
- Keep exact numbers, currencies, units, conditions, and totals when present.
- For CSV, XLSX, or JSON, make the table the primary output. Use concise columns and
  one logical record per row. Put totals in rows only when they are useful records.
- For DOCX, PDF, or TXT, preserve all meaningful source information. Reorganize it
  into readable sections, paragraphs, bullets, and a table when appropriate.
- The table rows must have exactly the same number of values as the table columns.
- Return empty arrays for content that genuinely does not apply.
""".strip()


def _format_guidance(output_format: OutputFormat) -> str:
    if output_format in {
        OutputFormat.CSV,
        OutputFormat.XLSX,
        OutputFormat.JSON,
    }:
        return (
            "Prioritize a clean dataset. Exclude surrounding commentary unless it "
            "contains a necessary field, warning, subtotal, or total."
        )
    return (
        "Prioritize a polished full document. Preserve the source's meaningful "
        "narrative, recommendations, warnings, and structured data."
    )


async def create_conversion_plan(
    text: str,
    output_format: OutputFormat,
    instructions: str,
    settings: Settings,
) -> ConversionPlan:
    if not settings.google_api_key:
        raise RuntimeError(
            "GOOGLE_API_KEY is not configured. Add it to backend/.env."
        )

    model = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        api_key=settings.google_api_key,
        temperature=0.1,
        max_retries=2,
        timeout=90,
    )
    structured_model = model.with_structured_output(
        schema=ConversionPlan.model_json_schema(),
        method="json_schema",
    )

    user_prompt = (
        f"Target format: {output_format.value.upper()}\n"
        f"Format guidance: {_format_guidance(output_format)}\n"
        f"Additional user instructions: {instructions or 'None'}\n\n"
        f"SOURCE TEXT:\n{text}"
    )
    result = await structured_model.ainvoke(
        [SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=user_prompt)]
    )
    return ConversionPlan.model_validate(result)
