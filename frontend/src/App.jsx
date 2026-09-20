import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import LanguageSelector from './components/LanguageSelector';
import VoiceSelector from './components/VoiceSelector';
import AudioCustomizer from './components/AudioCustomizer';
import GenerateButton from './components/GenerateButton';
import AudioPlayer from './components/AudioPlayer';
import DownloadButton from './components/DownloadButton';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import AuthPage from './components/AuthPage';
import FileUploadTab from './components/FileUploadTab';
import AiToolsTab from './components/AiToolsTab';
import HistoryTab from './components/HistoryTab';
import FavoritesTab from './components/FavoritesTab';
import UserAnalyticsTab from './components/UserAnalyticsTab';
import AdminAnalyticsTab from './components/AdminAnalyticsTab';
import {
  getHealth,
  getLanguages,
  getVoices,
  generateTts,
  getStoredUser,
  setAuthToken,
  setStoredUser,
  logoutUser,
  addFavorite,
} from './services/api';
import { Star } from 'lucide-react';

const SAMPLES = {
  'en-US': "Hello, welcome to our Text to Speech application! You can type or paste any text here, choose your preferred voice, and convert it to natural audio.",
  'en-GB': "Good day! Welcome to our speech synthesizer. This audio is produced from your text with natural intonation.",
  'hi-IN': "नमस्ते! टेक्स्ट-टू-स्पीच एप्लिकेशन में आपका स्वागत है। आप किसी भी पाठ को प्राकृतिक ध्वनि में परिवर्तित कर सकते हैं।",
  'gu-IN': "નમસ્તે! આ ટેક્સ્ટ-ટુ-સ્પીચ એપ્લિકેશનમાં તમારું સ્વાગત છે. તમે તમારા લખાણને કુદરતી અવાજમાં સાંભળી શકો છો.",
  'mr-IN': "नमस्कार! टेक्स्ट-टू-स्पीच ॲप्लिकेशनमध्ये आपले स्वागत आहे. येथे मजकूर प्रविष्ट करा आणि आवाजात ऐका.",
  'es-ES': "¡Hola! Bienvenido a nuestra aplicación de texto a voz. Convierte cualquier texto en audio natural rápidamente.",
  'fr-FR': "Bonjour et bienvenue dans notre application de synthèse vocale. Écoutez vos textes prononcés naturellement.",
  'de-DE': "Hallo und herzlich willkommen bei unserer Text-zu-Sprache-Anwendung. Wir wandeln Texte in natürliche Sprache um.",
  'it-IT': "Ciao e benvenuti nella nossa applicazione di sintesi vocale. Trasforma i tuoi testi in audio naturale.",
  'ja-JP': "こんにちは！テキスト読み上げアプリケーションへようこそ。自然な音声でテキストを読み上げます。"
};

export default function App() {
  const [backendStatus, setBackendStatus] = useState('CHECKING');
  const [providerName, setProviderName] = useState('');
  const [languages, setLanguages] = useState([]);
  const [voices, setVoices] = useState([]);

  // Synthesizer State
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [selectedVoice, setSelectedVoice] = useState('en-US-Standard');
  const [text, setText] = useState(SAMPLES['en-US']);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [voiceStyle, setVoiceStyle] = useState('Standard');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioResult, setAudioResult] = useState(null);

  // Authentication State
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('auth');

  useEffect(() => {
    // Check initial user from localStorage
    const savedUser = getStoredUser();
    if (savedUser) {
      setUser(savedUser);
      setActiveTab('synth');
    } else {
      setActiveTab('auth');
    }
    checkHealthAndLoadData();

    const handleAuthExpired = () => {
      setUser(null);
      setActiveTab('auth');
      setErrorMessage('Your session has expired. Please sign in again.');
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  const checkHealthAndLoadData = async () => {
    try {
      setBackendStatus('CHECKING');
      const health = await getHealth();
      setBackendStatus(health.status === 'UP' ? 'UP' : 'OFFLINE');
      setProviderName(health.provider || 'Natural TTS Engine');

      const langs = await getLanguages();
      setLanguages(langs);

      if (langs && langs.length > 0) {
        const defaultLang = langs[0].code;
        setSelectedLanguage(defaultLang);
        const langVoices = await getVoices(defaultLang);
        setVoices(langVoices);
        if (langVoices && langVoices.length > 0) {
          setSelectedVoice(langVoices[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to initialize application:', err);
      setBackendStatus('OFFLINE');
    }
  };

  const handleLanguageChange = async (langCode) => {
    setSelectedLanguage(langCode);
    setErrorMessage('');
    try {
      const langVoices = await getVoices(langCode);
      setVoices(langVoices);
      if (langVoices && langVoices.length > 0) {
        setSelectedVoice(langVoices[0].id);
      }
      if (SAMPLES[langCode]) {
        setText(SAMPLES[langCode]);
      }
    } catch (err) {
      console.error('Failed to load voices:', err);
      setErrorMessage('Could not load voices for selected language.');
    }
  };

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMessage('Please enter or paste some text before generating speech.');
      return;
    }
    if (trimmed.length > 2500) {
      setErrorMessage(`Text exceeds the 2500-character maximum limit (${trimmed.length} characters).`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await generateTts({
        text: trimmed,
        language: selectedLanguage,
        voice: selectedVoice,
        speed,
        pitch,
        voiceStyle,
      });

      if (result && result.success) {
        setAudioResult(result);
      } else {
        throw new Error(result?.message || 'Failed to generate audio stream.');
      }
    } catch (err) {
      console.error('TTS Generation error:', err);
      setErrorMessage(err.message || 'An error occurred while generating speech. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser) => {
    setUser(authenticatedUser);
    setActiveTab('synth');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setActiveTab('auth');
    setAudioResult(null);
  };

  const handleFavoriteVoice = async () => {
    if (!user) {
      setActiveTab('auth');
      return;
    }
    try {
      await addFavorite({
        targetType: 'VOICE',
        referenceId: selectedVoice,
        title: `${selectedVoice} (${selectedLanguage})`,
        metadataJson: JSON.stringify({ language: selectedLanguage }),
      });
      alert('Voice added to your favorites!');
    } catch (err) {
      alert(err.message || 'Could not favorite voice.');
    }
  };

  const isOverLimit = text.length > 2500;
  const isGenerateDisabled = !text.trim() || isOverLimit || isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header
        backendStatus={backendStatus}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (!user) {
            setActiveTab('auth');
          } else {
            setActiveTab(tab);
          }
        }}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Error Banner */}
        {errorMessage && (
          <ErrorMessage
            message={errorMessage}
            onDismiss={() => setErrorMessage('')}
          />
        )}

        {/* AUTHENTICATION GATE: User must authenticate first to use the application */}
        {!user ? (
          <AuthPage
            user={null}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        ) : (
          <>
            {/* TAB 1: CORE SYNTHESIZER */}
            {activeTab === 'synth' && (
          <div className="space-y-8">
            {/* Main Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="text-center pb-2 border-b border-slate-100">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  Text to Natural Speech
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Convert text into high-fidelity speech across multiple languages, voices, speeds, and pitches.
                </p>
              </div>

              {/* Text Input */}
              <TextInput
                text={text}
                onChange={setText}
                onClear={() => {
                  setText('');
                  setErrorMessage('');
                }}
                maxLength={2500}
                disabled={isLoading}
                onSampleSelect={() => setText(SAMPLES[selectedLanguage] || SAMPLES['en-US'])}
              />

              {/* Language & Voice Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <LanguageSelector
                  languages={languages}
                  selectedLanguage={selectedLanguage}
                  onChange={handleLanguageChange}
                  disabled={isLoading}
                />

                <div className="relative">
                  <VoiceSelector
                    voices={voices}
                    selectedVoice={selectedVoice}
                    onChange={setSelectedVoice}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={handleFavoriteVoice}
                    className="absolute top-0 right-0 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center space-x-0.5 pt-0.5"
                    title="Bookmark this voice"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Favorite</span>
                  </button>
                </div>
              </div>

              {/* Audio Customizations (Speed, Pitch, Voice Style) */}
              <AudioCustomizer
                speed={speed}
                onSpeedChange={setSpeed}
                pitch={pitch}
                onPitchChange={setPitch}
                voiceStyle={voiceStyle}
                onVoiceStyleChange={setVoiceStyle}
                disabled={isLoading}
              />

              {/* Generate Speech Button */}
              <div className="pt-2">
                <GenerateButton
                  onClick={handleGenerate}
                  isLoading={isLoading}
                  disabled={isGenerateDisabled}
                />
              </div>
            </div>

            {/* Generated Audio Player & Download */}
            {audioResult && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    Generated Audio
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {audioResult.voiceStyle || 'Standard'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800">
                      MP3 Audio
                    </span>
                  </div>
                </div>

                <AudioPlayer
                  audioData={audioResult.audioData}
                  audioUrl={audioResult.audioUrl}
                  metadata={audioResult}
                />

                <div className="pt-2">
                  <DownloadButton
                    audioData={audioResult.audioData}
                    audioUrl={audioResult.audioUrl}
                    filename={`${audioResult.audioId || 'speech'}.mp3`}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FILE TO SPEECH */}
        {activeTab === 'files' && (
          <FileUploadTab
            onSendToSynthesizer={(extracted) => {
              setText(extracted);
              setActiveTab('synth');
            }}
          />
        )}

        {/* TAB 3: AI OPTIMIZER */}
        {activeTab === 'ai' && (
          <AiToolsTab
            initialText={text}
            onApplyEnhancedText={(enhanced) => {
              setText(enhanced);
              setActiveTab('synth');
            }}
          />
        )}

        {/* TAB 4: SPEECH HISTORY */}
        {activeTab === 'history' && (
          <HistoryTab
            user={user}
            onPlayAudio={(audioUrl, item) => {
              setAudioResult({
                audioUrl,
                audioData: null,
                text: item.text,
                language: item.language,
                voice: item.voice,
                characterCount: item.characterCount,
                wordCount: item.wordCount,
              });
              setActiveTab('synth');
            }}
          />
        )}

        {/* TAB 5: FAVORITES */}
        {activeTab === 'favorites' && (
          <FavoritesTab
            user={user}
            onOpenAuth={() => setActiveTab('auth')}
            onSelectVoice={(voiceId, langCode) => {
              if (langCode) setSelectedLanguage(langCode);
              setSelectedVoice(voiceId);
              setActiveTab('synth');
            }}
            onPlayAudio={(audioUrl) => {
              setAudioResult({ audioUrl, audioData: null, text: 'Favorite audio' });
              setActiveTab('synth');
            }}
          />
        )}

        {/* TAB 6: PERSONAL USER ANALYTICS */}
        {activeTab === 'user-analytics' && (
          <UserAnalyticsTab
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 7: ADMIN CONSOLE & SYSTEM ANALYTICS */}
        {activeTab === 'admin' && (
          <AdminAnalyticsTab
            user={user}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 7: AUTHENTICATION / ACCOUNT */}
        {activeTab === 'auth' && (
          <AuthPage
            user={user}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
          </>
        )}
      </main>

      <Footer providerName={providerName} />
    </div>
  );
}
