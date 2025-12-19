import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotesCalendar = ({ notes, onDateSelect, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const hasNoteOnDate = (date) => {
    const dateStr = new Date(date).toDateString();
    return notes.some(note => 
      new Date(note.noteDate).toDateString() === dateStr
    );
  };

  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return new Date(date).toDateString() === new Date(selectedDate).toDateString();
  };

  const isToday = (date) => {
    return new Date(date).toDateString() === new Date().toDateString();
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(date);
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="rounded-xl bg-slate-800 border border-white/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </button>
        
        <h3 className="text-lg font-semibold text-white">{monthName}</h3>
        
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const hasNote = hasNoteOnDate(date);
          const selected = isSelectedDate(date);
          const today = isToday(date);

          return (
            <motion.button
              key={day}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDateClick(day)}
              className={`
                relative aspect-square rounded-lg text-sm font-medium transition-all
                ${selected 
                  ? 'bg-blue-500 text-white' 
                  : today
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-700'
                }
              `}
            >
              {day}
              
              {/* Note indicator */}
              {hasNote && !selected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <span>Has notes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-blue-500/50 border border-blue-500 rounded" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};
