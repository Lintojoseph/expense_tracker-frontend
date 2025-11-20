import React from 'react';
import { Plus } from 'lucide-react';

function FloatingActionButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
    >
      <Plus className="w-6 h-6" />
    </button>
  );
}

export default FloatingActionButton;