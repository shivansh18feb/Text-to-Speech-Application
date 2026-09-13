import React from 'react';

export default function Footer({ providerName }) {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500 space-y-2">
      <div className="flex items-center justify-center space-x-2">
        <span>Powered by Spring Boot & React</span>
        <span>•</span>
        <span>Engine: <strong className="text-slate-700">{providerName || 'Natural Speech Synthesis'}</strong></span>
      </div>
      <p className="text-slate-400">
        Full-Stack Text-to-Speech Web Application
      </p>
    </footer>
  );
}
