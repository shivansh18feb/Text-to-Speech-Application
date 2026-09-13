import React, { useState } from 'react';
import { Download, Check, FileAudio, Loader2 } from 'lucide-react';
import { convertToWav, convertToOgg, getSourceBlob } from '../utils/audioConverter';

export default function DownloadButton({ audioData, audioUrl, filename = 'speech' }) {
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [downloading, setDownloading] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState(null);

  const formats = [
    {
      id: 'mp3',
      label: 'MP3',
      badge: 'Standard',
      desc: 'Universal compatibility, compressed',
      ext: '.mp3',
      mime: 'audio/mpeg',
    },
    {
      id: 'wav',
      label: 'WAV',
      badge: 'Lossless',
      desc: '16-bit uncompressed PCM, studio quality',
      ext: '.wav',
      mime: 'audio/wav',
    },
    {
      id: 'ogg',
      label: 'OGG',
      badge: 'Open Audio',
      desc: 'Opus/Vorbis container, high fidelity',
      ext: '.ogg',
      mime: 'audio/ogg',
    },
  ];

  const triggerDownload = (blob, outFilename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownload = async (formatOverride = null) => {
    const fmt = formatOverride || selectedFormat;
    setDownloading(true);

    try {
      const baseName = filename.replace(/\.(mp3|wav|ogg)$/i, '');

      if (fmt === 'mp3') {
        if (audioData && audioData.startsWith('data:')) {
          const blob = await getSourceBlob(audioData, null);
          triggerDownload(blob, `${baseName}.mp3`);
        } else if (audioUrl) {
          const downloadEndpoint = audioUrl.includes('?')
            ? `${audioUrl}&download=true`
            : `${audioUrl}?download=true`;
          const a = document.createElement('a');
          a.href = downloadEndpoint;
          a.download = `${baseName}.mp3`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else if (fmt === 'wav') {
        const wavBlob = await convertToWav(audioData, audioUrl);
        triggerDownload(wavBlob, `${baseName}.wav`);
      } else if (fmt === 'ogg') {
        const oggBlob = await convertToOgg(audioData, audioUrl);
        triggerDownload(oggBlob, `${baseName}.ogg`);
      }

      setDownloadedFormat(fmt);
      setTimeout(() => setDownloadedFormat(null), 3000);
    } catch (err) {
      console.error(`Failed to download audio in ${fmt.toUpperCase()} format:`, err);
      alert(`Could not process ${fmt.toUpperCase()} format: ${err.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
      {/* Format Selector Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <FileAudio className="w-3.5 h-3.5 text-sky-600" />
            <span>Select Download Format:</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            3 High-Quality Codecs Available
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {formats.map((f) => {
            const isSelected = selectedFormat === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFormat(f.id)}
                className={`px-3 py-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-white border-sky-500 shadow-sm ring-2 ring-sky-100'
                    : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-sky-700' : 'text-slate-800'}`}>
                    .{f.id.toUpperCase()}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-sky-100 text-sky-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {f.badge}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Download Button */}
      <button
        type="button"
        disabled={downloading}
        onClick={() => handleDownload()}
        className={`w-full py-3 px-6 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all shadow-md focus:outline-none focus:ring-4 disabled:opacity-60 ${
          downloadedFormat
            ? 'bg-emerald-600 text-white focus:ring-emerald-200'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-200 hover:shadow-lg'
        }`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Converting to {selectedFormat.toUpperCase()}...</span>
          </>
        ) : downloadedFormat ? (
          <>
            <Check className="w-5 h-5" />
            <span>Downloaded as .{downloadedFormat.toUpperCase()}!</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download Audio as .{selectedFormat.toUpperCase()}</span>
          </>
        )}
      </button>

      {/* Direct One-Click Download Format Links */}
      <div className="flex items-center justify-center space-x-3 pt-1 text-[11px] text-slate-500">
        <span>Quick Download:</span>
        {formats.map((f) => (
          <button
            key={f.id}
            type="button"
            disabled={downloading}
            onClick={() => handleDownload(f.id)}
            className="hover:text-sky-600 font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-sky-500 transition-colors"
          >
            .{f.id.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
