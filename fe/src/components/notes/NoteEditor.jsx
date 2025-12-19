import { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';

export const NoteEditor = ({ cityName, date, existingNote, onSave, onCancel }) => {
  const [content, setContent] = useState(existingNote?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const { autoSaveDraft, clearDraft } = useNotes();

  const MAX_LENGTH = 500;
  const remainingChars = MAX_LENGTH - content.length;

  useEffect(() => {
    // Auto-save draft
    if (content && content !== existingNote?.content) {
      autoSaveDraft(content, cityName, date);
    }
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) {
      return;
    }

    setIsSaving(true);
    
    // Simulate save delay
    setTimeout(() => {
      onSave(content);
      clearDraft();
      setIsSaving(false);
    }, 500);
  };

  const handleCancel = () => {
    clearDraft();
    onCancel();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-800 border border-white/10 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-white">📝 Your Notes</h3>
          <p className="text-xs text-slate-400">
            {cityName} - {new Date(date).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-300 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || isSaving || content === existingNote?.content}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            title="Save note"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        value={content}
        onChange={(e) => {
          if (e.target.value.length <= MAX_LENGTH) {
            setContent(e.target.value);
          }
        }}
        placeholder="Write your weather notes here... (e.g., 'Perfect day for cycling', 'Remember to bring umbrella')"
        className="w-full h-32 px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none text-sm"
        autoFocus
      />

      {/* Character Count */}
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-slate-500">
          {existingNote ? 'Editing existing note' : 'Creating new note'}
        </p>
        <p className={`text-xs ${
          remainingChars < 50 ? 'text-orange-400' : 'text-slate-500'
        }`}>
          {remainingChars} characters remaining
        </p>
      </div>
    </motion.div>
  );
};
