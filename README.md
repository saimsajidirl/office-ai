# Office AI

Office AI is a web application that turns raw, unstructured text into polished,
downloadable office files.

Instead of manually asking an AI to identify columns, clean the content, format
it, and then create a file, users can do the entire job from one website:

1. Paste any raw data or prompt.
2. Select the required file type.
3. Optionally provide formatting instructions.
4. Let Office AI organize the content.
5. Preview and download the finished file.

## What Office AI Can Convert

Office AI accepts many kinds of raw content, including:

- Product and price lists
- Reports and research notes
- Meeting notes
- Inventory data
- Contact lists
- Expense breakdowns
- Business information
- AI-generated responses
- Poorly formatted tables
- Mixed paragraphs, numbers, and lists

The source does not need to follow a fixed structure. Office AI identifies the
useful information and determines how it should be organized for the selected
output format.

## Supported File Types

- **CSV**: Clean rows and columns for data processing or import
- **XLSX**: A formatted Microsoft Excel spreadsheet
- **DOCX**: A structured Microsoft Word document
- **PDF**: A polished document ready to share
- **JSON**: Structured records for software and APIs
- **TXT**: Clean, readable plain text

Tabular formats such as CSV and XLSX focus on concise records and relevant
columns. Document formats such as DOCX and PDF preserve meaningful narrative
content while adding headings, paragraphs, lists, and tables.

## Main Features

- AI-powered detection of records, fields, totals, notes, and categories
- Automatic removal of irrelevant filler from tabular exports
- Preservation of important facts, prices, currencies, and measurements
- File preview before downloading
- Optional custom formatting instructions
- Recent conversion history stored in the browser
- No application database
- Server-side Gemini API key protection
- Spreadsheet formula-injection protection
- Responsive React interface

## Technology

Office AI uses:

- React and Vite for the frontend
- FastAPI and Python for the backend
- LangChain for AI orchestration
- Google Gemini for understanding and structuring raw content
- Native Python libraries for generating CSV, XLSX, DOCX, PDF, JSON, and TXT

Gemini creates a validated content plan. The backend then generates the actual
file, ensuring the downloaded output is valid for its selected format.

## Data and Privacy

Office AI has no database. Recent conversions are stored in the user's browser
using `localStorage`.

Raw content is sent to the configured Google Gemini API for processing. The
Gemini API key remains on the backend and is never exposed to the frontend.
Users can remove browser-stored conversion history by selecting **Clear
history**.

## Running the Project

Developer installation, environment configuration, testing, and run commands
are documented in [setup.md](setup.md).

