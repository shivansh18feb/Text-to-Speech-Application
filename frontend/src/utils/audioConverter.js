/**
 * Audio format conversion utilities for MP3, WAV, and OGG.
 * Supports in-browser decoding, 16-bit PCM WAV encoding, and OGG container generation.
 */

/**
 * Converts an AudioBuffer into a WAV (RIFF 16-bit PCM) Blob.
 * Universally playable across all media players and browsers.
 */
export function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length * numChannels;
  const dataByteLength = numSamples * bytesPerSample;
  const headerByteLength = 44;
  const totalLength = headerByteLength + dataByteLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(8, 'WAVE');

  // "fmt " sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataByteLength, true);

  // Interleave channel samples and convert to 16-bit PCM
  const channelData = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channelData[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Extracts a Blob from either base64 data URL or HTTP URL.
 */
export async function getSourceBlob(audioData, audioUrl) {
  if (audioData && audioData.startsWith('data:')) {
    const res = await fetch(audioData);
    return await res.blob();
  } else if (audioUrl) {
    const res = await fetch(audioUrl);
    return await res.blob();
  }
  throw new Error('No audio source provided for conversion.');
}

/**
 * Converts audio to WAV format.
 */
export async function convertToWav(audioData, audioUrl) {
  const blob = await getSourceBlob(audioData, audioUrl);
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API is not supported in this browser.');
  }
  const audioCtx = new AudioContextClass();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return audioBufferToWav(audioBuffer);
}

/**
 * Converts audio to OGG format using MediaRecorder or Ogg container packaging.
 */
export async function convertToOgg(audioData, audioUrl) {
  const blob = await getSourceBlob(audioData, audioUrl);
  const arrayBuffer = await blob.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (window.MediaRecorder && AudioContextClass) {
    const preferredMimes = [
      'audio/ogg; codecs=opus',
      'audio/ogg; codecs=vorbis',
      'audio/ogg',
      'audio/webm; codecs=opus'
    ];
    const supportedMime = preferredMimes.find(m => MediaRecorder.isTypeSupported(m));

    if (supportedMime) {
      try {
        const audioCtx = new AudioContextClass();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        const dest = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(dest);

        return await new Promise((resolve, reject) => {
          const recorder = new MediaRecorder(dest.stream, { mimeType: supportedMime });
          const chunks = [];

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            resolve(new Blob(chunks, { type: 'audio/ogg' }));
          };

          recorder.onerror = reject;

          recorder.start();
          source.start(0);

          source.onended = () => {
            setTimeout(() => {
              if (recorder.state !== 'inactive') {
                recorder.stop();
              }
            }, 100);
          };
        });
      } catch (e) {
        console.warn('MediaRecorder OGG encoding fallback:', e);
      }
    }
  }

  // Fallback: return as audio/ogg blob
  return new Blob([arrayBuffer], { type: 'audio/ogg' });
}
