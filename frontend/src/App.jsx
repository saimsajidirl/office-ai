import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  LoaderCircle,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const HISTORY_KEY = "office-ai-history-v1";

const FORMATS = [
  {
    id: "csv",
    label: "CSV",
    detail: "Clean rows and columns",
    icon: FileSpreadsheet,
  },
  {
    id: "xlsx",
    label: "Excel",
    detail: "Styled spreadsheet",
    icon: FileSpreadsheet,
  },
  {
    id: "docx",
    label: "Word",
    detail: "Formatted document",
    icon: FileText,
  },
  {
    id: "pdf",
    label: "PDF",
    detail: "Ready to share",
    icon: FileText,
  },
  {
    id: "json",
    label: "JSON",
    detail: "Structured records",
    icon: FileJson,
  },
  {
    id: "txt",
    label: "Text",
    detail: "Polished plain text",
    icon: FileText,
  },
];

const SAMPLE_TEXT = `Final Cost Breakdown
Ryzen 5 3600 (Tray/No Box) - Used - Rs. 16,500
Gigabyte B450M DS3H - Used - Rs. 21,500
Corsair Vengeance LPX 16GB (2x8GB) 3200MHz - Used - Rs. 11,000
Lexar NQ100 256GB - New - Rs. 7,200
Sapphire Pulse RX 5700 XT 8GB - Used - Rs. 52,000
Dell Professional P2419H (24" IPS 1080p) - Used - Rs. 20,000
Basic Default Case - Used - Rs. 0 (Default with PC)
PC & Monitor Total: Rs. 144,200

Remember to inspect the used monitor for white spots or dead pixels.`;

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function persistHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 8)));
  } catch {
    const lightweight = items.slice(0, 8).map(({ file_base64, ...item }) => item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(lightweight));
  }
}

function base64ToBlob(base64, mimeType) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function downloadFile(result) {
  if (!result?.file_base64) return;
  const url = URL.createObjectURL(
    base64ToBlob(result.file_base64, result.mime_type),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = result.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [text, setText] = useState("");
  const [format, setFormat] = useState("csv");
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(readHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiReady, setApiReady] = useState(null);

  const selectedFormat = useMemo(
    () => FORMATS.find((item) => item.id === format),
    [format],
  );

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((response) => response.json())
      .then((data) => setApiReady(data.gemini_configured))
      .catch(() => setApiReady(false));
  }, []);

  async function handleConvert(event) {
    event.preventDefault();
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          output_format: format,
          instructions,
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.detail || "The conversion could not be completed.");
      }

      const historyItem = {
        ...payload,
        source_text: text,
        instructions,
        created_at: new Date().toISOString(),
      };
      setResult(payload);
      const nextHistory = [historyItem, ...history].slice(0, 8);
      setHistory(nextHistory);
      persistHistory(nextHistory);
    } catch (conversionError) {
      setError(conversionError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function openHistory(item) {
    setText(item.source_text || "");
    setFormat(item.output_format || "csv");
    setInstructions(item.instructions || "");
    setResult(item.file_base64 ? item : null);
    setError(
      item.file_base64
        ? ""
        : "This older item has no cached file. Convert it again to download.",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="site-header">
        <a className="brand" href="#" aria-label="Office AI home">
          <span className="brand-mark">
            <WandSparkles size={19} />
          </span>
          <span>Office AI</span>
        </a>
        <div
          className={`status-pill ${apiReady === true ? "is-ready" : ""}`}
          title="FastAPI and Gemini connection status"
        >
          <span className="status-dot" />
          {apiReady === null
            ? "Checking API"
            : apiReady
              ? "Gemini ready"
              : "Setup needed"}
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={15} />
            AI-powered data formatting
          </div>
          <h1>
            Messy text in.
            <span> Useful files out.</span>
          </h1>
          <p>
            Paste any raw content. Gemini finds the signal, organizes the data,
            and gives you a polished file ready to use.
          </p>
        </section>

        <section className="workspace-grid">
          <form className="converter-card" onSubmit={handleConvert}>
            <div className="card-heading">
              <div>
                <span className="step-label">01 / SOURCE</span>
                <h2>Drop in your raw content</h2>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => setText(SAMPLE_TEXT)}
              >
                Use example
              </button>
            </div>

            <div className="textarea-wrap">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Paste a price list, report, meeting notes, product data, research, or any unstructured text..."
                maxLength={50000}
                required
              />
              <span className="character-count">
                {text.length.toLocaleString()} / 50,000
              </span>
            </div>

            <div className="format-section">
              <span className="step-label">02 / OUTPUT</span>
              <h2>Choose your file type</h2>
              <div className="format-grid">
                {FORMATS.map((item) => {
                  const Icon = item.icon;
                  const active = format === item.id;
                  return (
                    <button
                      className={`format-option ${active ? "is-active" : ""}`}
                      type="button"
                      key={item.id}
                      onClick={() => setFormat(item.id)}
                      aria-pressed={active}
                    >
                      <span className="format-icon">
                        <Icon size={20} />
                      </span>
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </span>
                      {active && <Check className="format-check" size={16} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="instructions-field">
              <span>
                Special instructions <small>Optional</small>
              </span>
              <input
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                placeholder='For example: "Separate furniture from PC parts"'
                maxLength={2000}
              />
            </label>

            {error && <div className="error-message">{error}</div>}

            <button
              className="convert-button"
              type="submit"
              disabled={!text.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="spin" size={19} />
                  Structuring your content
                </>
              ) : (
                <>
                  Convert to {selectedFormat.label}
                  <ArrowRight size={19} />
                </>
              )}
            </button>
            <p className="privacy-note">
              <Database size={14} />
              No database. Your recent files stay in this browser.
            </p>
          </form>

          <aside className="result-card">
            <div className="result-header">
              <div>
                <span className="step-label">03 / RESULT</span>
                <h2>Your finished file</h2>
              </div>
              {result && (
                <span className="complete-badge">
                  <Check size={14} />
                  Complete
                </span>
              )}
            </div>

            {result ? (
              <div className="result-content">
                <div className="file-tile">
                  <span className="large-file-icon">
                    <FileText size={27} />
                  </span>
                  <div>
                    <strong>{result.filename}</strong>
                    <span>{result.output_format.toUpperCase()} file</span>
                  </div>
                </div>

                <div className="preview-panel">
                  <div className="preview-label">AI preview</div>
                  <pre>{result.preview}</pre>
                </div>

                <button
                  className="download-button"
                  type="button"
                  onClick={() => downloadFile(result)}
                >
                  <Download size={18} />
                  Download {result.filename}
                </button>
              </div>
            ) : (
              <div className="empty-result">
                <div className="empty-visual">
                  <FileText size={34} />
                  <span className="spark spark-one" />
                  <span className="spark spark-two" />
                  <span className="spark spark-three" />
                </div>
                <h3>Ready when you are</h3>
                <p>
                  Your preview and download will appear here after Gemini
                  organizes the source.
                </p>
                <div className="process-list">
                  <span><Check size={14} /> Finds the useful data</span>
                  <span><Check size={14} /> Removes irrelevant filler</span>
                  <span><Check size={14} /> Builds a valid file</span>
                </div>
              </div>
            )}
          </aside>
        </section>

        {history.length > 0 && (
          <section className="history-section">
            <div className="history-heading">
              <div>
                <span className="step-label">BROWSER MEMORY</span>
                <h2>Recent conversions</h2>
              </div>
              <button className="clear-button" type="button" onClick={clearHistory}>
                <Trash2 size={15} />
                Clear history
              </button>
            </div>
            <div className="history-grid">
              {history.map((item) => (
                <button
                  className="history-item"
                  type="button"
                  key={`${item.created_at}-${item.filename}`}
                  onClick={() => openHistory(item)}
                >
                  <span className="history-icon">
                    <FileText size={19} />
                  </span>
                  <span className="history-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {item.output_format.toUpperCase()} ·{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </small>
                  </span>
                  <Clock3 size={15} />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer>
        <span>Office AI</span>
        <span>React + FastAPI + Gemini</span>
      </footer>
    </div>
  );
}
