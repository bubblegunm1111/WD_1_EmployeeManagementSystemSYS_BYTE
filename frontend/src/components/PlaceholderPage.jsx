import React from 'react';
import { Construction } from 'lucide-react';

function PlaceholderPage({ title }) {
  return (
    <div className="flex h-full w-full bg-[#fdfcfa] overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto px-8 py-6">
        <div className="w-24 h-24 bg-[#f3e8ff] rounded-full flex items-center justify-center text-[#9333ea] mb-6">
          <Construction size={48} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#1e293b] tracking-tight mb-2">{title}</h1>
        <p className="text-gray-500 font-medium text-center max-w-md">
          This section is currently under construction. Check back soon for updates and new functionality.
        </p>
      </div>
    </div>
  );
}

export default PlaceholderPage;
