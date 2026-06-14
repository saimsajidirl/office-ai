from enum import StrEnum

from pydantic import BaseModel, Field, field_validator


class OutputFormat(StrEnum):
    CSV = "csv"
    XLSX = "xlsx"
    DOCX = "docx"
    PDF = "pdf"
    JSON = "json"
    TXT = "txt"


class TableData(BaseModel):
    title: str = Field(description="Short descriptive title for the table")
    columns: list[str] = Field(description="Clear, concise column labels")
    rows: list[list[str]] = Field(description="Rows aligned to the column order")


class DocumentSection(BaseModel):
    heading: str = Field(description="Useful section heading")
    paragraphs: list[str] = Field(description="Polished paragraphs for the section")
    bullets: list[str] = Field(description="Concise bullet points when appropriate")


class ConversionPlan(BaseModel):
    title: str = Field(description="A clear title inferred from the source")
    summary: str = Field(description="A short summary of the source content")
    table: TableData
    sections: list[DocumentSection]
    notes: list[str] = Field(
        description="Important caveats or recommendations found in the source"
    )

    @field_validator("title", "summary")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Value cannot be empty")
        return value


class ConversionRequest(BaseModel):
    text: str = Field(min_length=1, max_length=50_000)
    output_format: OutputFormat
    instructions: str = Field(default="", max_length=2_000)

    @field_validator("text")
    @classmethod
    def strip_input(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Text cannot be blank")
        return value


class ConversionResponse(BaseModel):
    filename: str
    mime_type: str
    file_base64: str
    preview: str
    title: str
    output_format: OutputFormat

