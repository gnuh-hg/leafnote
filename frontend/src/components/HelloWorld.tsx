import React from 'react';

const HelloWorld: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="bg-paper-100 border border-paper-300/60 rounded-2xl dark:bg-ink-850 dark:border-ink-700/60 p-12 max-w-md w-full text-center animate-fade-in shadow-sm">
        <h1 className="text-4xl font-sans font-bold text-zinc-900 dark:text-zinc-100">
          Hello from <span className="text-emerald-500">Gemini</span>
        </h1>
        <p className="mt-4 text-zinc-500 font-serif leading-relaxed">
          Your knowledge is a tree, and every insight is a leaf.
          Welcome to the intelligent future of note-taking.
        </p>
        <div className="mt-8 pt-6 border-t border-paper-300/60 dark:border-ink-700/60">
          <span className="text-xs font-sans uppercase tracking-widest text-zinc-500 font-medium">
            System Ready
          </span>
        </div>
      </div>
    </div>
  );
};

export default HelloWorld;
