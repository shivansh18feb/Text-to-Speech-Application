import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { extractDocument } from '../services/api';

export default function FileUploadTab({ onSendToSynthesizer }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const ext = selected.name.split('.').pop().toLowerCase();
    if (!['txt', 'pdf', 'docx'].includes(ext)) {
      setError('Unsupported file type. Please upload a .txt, .pdf, or .docx document.');
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      setError('File exceeds maximum allowed size of 15 MB.');
      return;
    }

    setError('');
    setFile(selected);
    processExtraction(selected);
  };

  const processExtraction = async (fileToUpload) => {
    setIsExtracting(true);
    setError('');
    try {
      const data = await extractDocument(fileToUpload);
      setExtractedText(data.text || '');
      setFileMeta(data);
    } catch (err) {
      setError(err.message || 'Failed to extract text from file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSend = () => {
    if (!extractedText.trim()) return;
    onSendToSynthesizer(extractedText.trim());
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Document to Speech</h2>
        <p className="text-xs text-slate-500 mt-1">
          Upload any text document (.txt, .pdf, or .docx) to extract its contents and synthesize into speech.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3">
          <UploadCloud className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">
          {file ? file.name : 'Click to select or drop document here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports TXT, PDF, and Word DOCX files (Up to 15 MB)
        </p>
      </div>

      {isExtracting && (
        <div className="flex items-center justify-center space-x-2 text-sky-600 font-semibold text-sm py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Parsing and extracting text from document...</span>
        </div>
      )}

      {/* Extracted Text Display & Editor */}
      {extractedText && !isExtracting && (
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800">
                Extracted Content ({fileMeta?.fileType?.toUpperCase()})
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {extractedText.length} characters • {extractedText.split(/\s+/).length} words
            </div>
          </div>

          <textarea
            rows={8}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full p-4 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 bg-slate-50/50 font-sans resize-y"
            placeholder="Review and edit the extracted text here before generating speech..."
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSend}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <span>Load into Speech Synthesizer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
