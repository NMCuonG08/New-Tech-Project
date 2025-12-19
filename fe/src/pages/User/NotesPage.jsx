import { useState } from 'react';
import { Search, Calendar, StickyNote, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotes } from '../../hooks/useNotes';
import { NoteCard } from '../../components/notes/NoteCard';
import { NoteEditor } from '../../components/notes/NoteEditor';
import { NotesCalendar } from '../../components/notes/NotesCalendar';
import toast from 'react-hot-toast';

export const NotesPage = () => {
  const { notes, saveNote, deleteNote, searchNotes, getNotesByDate } = useNotes();
  
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const displayedNotes = searchQuery 
    ? searchNotes(searchQuery)
    : selectedDate
    ? getNotesByDate(selectedDate)
    : notes;

  const handleSaveNote = (content) => {
    if (editingNote) {
      saveNote(editingNote.cityName, editingNote.noteDate, content);
      toast.success('Note updated successfully!');
      setEditingNote(null);
    } else if (isCreating) {
      // For new notes, we need city and date
      toast.error('Please select a city and date first');
    }
    setIsCreating(false);
  };

  const handleDeleteNote = (id) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
      toast.success('Note deleted');
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDate(null);
  };

  // Group notes by date
  const groupedNotes = displayedNotes.reduce((groups, note) => {
    const date = new Date(note.noteDate).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(note);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedNotes).sort((a, b) => 
    new Date(b) - new Date(a)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <StickyNote className="w-8 h-8 text-yellow-400" />
              Weather Notes
            </h1>
            <p className="text-slate-400 mt-2">
              Keep track of weather observations and reminders
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setView(view === 'list' ? 'calendar' : 'list')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-white hover:bg-slate-700 transition-colors"
            >
              {view === 'list' ? (
                <>
                  <Calendar className="w-4 h-4" />
                  Calendar View
                </>
              ) : (
                <>
                  <StickyNote className="w-4 h-4" />
                  List View
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedDate(null);
              }}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {(searchQuery || selectedDate) && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Stats */}
        {notes.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Total Notes</p>
              <p className="text-2xl font-bold text-white">{notes.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">This Month</p>
              <p className="text-2xl font-bold text-blue-400">
                {notes.filter(n => {
                  const noteMonth = new Date(n.noteDate).getMonth();
                  const currentMonth = new Date().getMonth();
                  return noteMonth === currentMonth;
                }).length}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800 border border-white/10">
              <p className="text-slate-400 text-sm mb-1">Cities</p>
              <p className="text-2xl font-bold text-yellow-400">
                {new Set(notes.map(n => n.cityName)).size}
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={view === 'calendar' ? 'grid md:grid-cols-2 gap-6' : ''}>
          {/* Calendar View */}
          {view === 'calendar' && (
            <div>
              <NotesCalendar
                notes={notes}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </div>
          )}

          {/* Notes List */}
          <div className="flex-1">
            {notes.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800 mb-6">
                  <StickyNote className="w-10 h-10 text-slate-600" />
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">
                  No notes yet
                </h2>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Start taking weather notes to remember important observations
                </p>
                <p className="text-sm text-slate-500">
                  💡 You can add notes from the weather detail page
                </p>
              </motion.div>
            ) : displayedNotes.length === 0 ? (
              /* No Results */
              <div className="text-center py-20">
                <p className="text-slate-400">No notes found</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-blue-400 hover:text-blue-300"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              /* Notes List */
              <div className="space-y-6">
                {sortedDates.map((date) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-400 mb-3 px-2">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <div className="space-y-3">
                      {groupedNotes[date].map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          onEdit={setEditingNote}
                          onDelete={handleDeleteNote}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal/Overlay */}
        {editingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl">
              <NoteEditor
                cityName={editingNote.cityName}
                date={editingNote.noteDate}
                existingNote={editingNote}
                onSave={handleSaveNote}
                onCancel={() => setEditingNote(null)}
              />
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm text-blue-300">
            📝 <strong>Tip:</strong> Notes are automatically saved as you type. 
            You can add notes directly from any weather detail page.
          </p>
        </div>
      </div>
    </div>
  );
};
