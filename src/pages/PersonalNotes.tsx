import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { id } from 'date-fns/locale';
import { Plus, Search, Calendar as CalendarIcon, Tag, Bell, Clock, MoreVertical, Edit2, Trash2, X, ChevronLeft, ChevronRight, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  date: Date; // We'll handle string<->Date conversion
  tags: string[];
  reminder?: Date;
  is_completed: boolean;
  user_id: string;
  created_at: string;
}

export function PersonalNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  
  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDate, setFormDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formTags, setFormTags] = useState('');
  const [formReminder, setFormReminder] = useState('');

  // Fetch Notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedNotes = (data || []).map((note: any) => ({
        ...note,
        date: new Date(note.date),
        reminder: note.reminder ? new Date(note.reminder) : undefined,
        // Ensure tags is an array
        tags: Array.isArray(note.tags) ? note.tags : []
      }));

      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar Logic
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // CRUD Operations
  const handleSaveNote = async () => {
    if (!formTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const tagsArray = formTags.split(',').map(t => t.trim()).filter(t => t);
      const reminderDate = formReminder ? new Date(`${formDate}T${formReminder}`).toISOString() : null;

      const noteData = {
        user_id: user.id,
        title: formTitle,
        content: formContent,
        date: formDate,
        tags: tagsArray,
        reminder: reminderDate,
        is_completed: editingNote ? editingNote.is_completed : false
      };

      if (editingNote) {
        const { error } = await supabase
          .from('personal_notes')
          .update(noteData)
          .eq('id', editingNote.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('personal_notes')
          .insert(noteData);
        
        if (error) throw error;
      }

      await fetchNotes();
      closeModal();
    } catch (error: any) {
      console.error('Error saving note:', error);
      alert('Gagal menyimpan catatan: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus catatan ini?')) {
      try {
        const { error } = await supabase
          .from('personal_notes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Optimistic update
        setNotes(notes.filter(n => n.id !== id));
      } catch (error: any) {
        console.error('Error deleting note:', error);
        alert('Gagal menghapus catatan: ' + error.message);
      }
    }
  };

  const toggleComplete = async (note: Note) => {
    try {
      // Optimistic update
      const updatedNotes = notes.map(n => 
        n.id === note.id ? { ...n, is_completed: !n.is_completed } : n
      );
      setNotes(updatedNotes);

      const { error } = await supabase
        .from('personal_notes')
        .update({ is_completed: !note.is_completed })
        .eq('id', note.id);

      if (error) {
        // Revert if error
        setNotes(notes);
        throw error;
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormTitle(note.title);
      setFormContent(note.content || '');
      setFormDate(format(note.date, 'yyyy-MM-dd'));
      setFormTags(note.tags.join(', '));
      setFormReminder(note.reminder ? format(note.reminder, 'HH:mm') : '');
    } else {
      setEditingNote(null);
      setFormTitle('');
      setFormContent('');
      setFormDate(format(selectedDate, 'yyyy-MM-dd'));
      setFormTags('');
      setFormReminder('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  // Filter Logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
    
    // If searching, ignore date filter. If tag selected, also ignore date filter? 
    // The original logic was: if searching, ignore date. If not searching, filter by date.
    // Let's keep it: Show selected date's notes unless searching or filtering by tag explicitly?
    // Actually, usually calendar view implies filtering by date.
    // Let's say: If search query exists, ignore date. If NO search query, strictly follow date.
    // Tag filter applies on top of whatever result.
    
    const matchesDate = isSameDay(note.date, selectedDate);
    
    if (searchQuery) {
      return matchesSearch && matchesTag;
    }
    
    return matchesDate && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] gap-6">
      {/* Sidebar / Left Column */}
      <div className="w-full lg:w-80 flex flex-col gap-6 overflow-y-auto pb-6">
        {/* Calendar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-slate-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-500 font-medium">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, idx) => {
              const hasNote = notes.some(n => isSameDay(n.date, day));
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm relative transition-all",
                    isSameDay(day, selectedDate) 
                      ? "bg-primary text-white font-bold" 
                      : isToday(day) 
                        ? "bg-slate-100 text-primary font-bold border border-primary/30" 
                        : "hover:bg-slate-50 text-slate-700"
                  )}
                >
                  {format(day, 'd')}
                  {hasNote && !isSameDay(day, selectedDate) && (
                    <span className="absolute bottom-1 w-1 h-1 bg-red-400 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories/Tags */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500" />
              Kategori
            </h3>
            {selectedTag && (
              <button 
                onClick={() => setSelectedTag(null)}
                className="text-xs text-primary hover:underline"
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                  tag === selectedTag
                    ? "bg-primary text-white border-primary"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/50"
                )}
              >
                #{tag}
              </button>
            ))}
            {allTags.length === 0 && <p className="text-xs text-slate-400">Belum ada tag.</p>}
          </div>
        </div>

        {/* Reminder Summary */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Pengingat Aktif
          </h3>
          <p className="text-xs text-blue-700">
            Anda memiliki {notes.filter(n => n.reminder && !n.is_completed).length} pengingat aktif yang belum selesai.
          </p>
        </div>
      </div>

      {/* Main Content / Right Column */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {searchQuery ? 'Hasil Pencarian' : format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
            </h1>
            <button 
              onClick={() => setIsHelpModalOpen(true)}
              className="text-slate-400 hover:text-primary ml-2"
              title="Panduan"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <button 
              onClick={() => openModal()}
              className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Catatan Baru
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div 
                key={note.id}
                className={cn(
                  "group p-4 rounded-lg border transition-all hover:shadow-md",
                  note.is_completed ? "bg-slate-50 border-slate-200 opacity-75" : "bg-white border-slate-200"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <button 
                      onClick={() => toggleComplete(note)}
                      className={cn(
                        "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        note.is_completed ? "bg-green-500 border-green-500 text-white" : "border-slate-300 hover:border-primary"
                      )}
                    >
                      {note.is_completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                    <div className="space-y-1">
                      <h3 className={cn("font-semibold text-slate-900", note.is_completed && "line-through text-slate-500")}>
                        {note.title}
                      </h3>
                      <p className={cn("text-sm text-slate-600", note.is_completed && "text-slate-400")}>
                        {note.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        {note.reminder && (
                          <span className={cn(
                            "text-xs flex items-center gap-1",
                            note.is_completed ? "text-slate-400" : "text-amber-600 font-medium"
                          )}>
                            <Clock className="w-3 h-3" />
                            {format(note.reminder, 'HH:mm')}
                          </span>
                        )}
                        <div className="flex gap-2">
                          {note.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(note)}
                      className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
              <p>Tidak ada catatan untuk tanggal/filter ini.</p>
              <button onClick={() => openModal()} className="mt-4 text-primary text-sm hover:underline">
                Buat catatan baru
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">
                {editingNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Bayar Pajak Masa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Isi Catatan</label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={3}
                  placeholder="Detail catatan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Waktu Pengingat</label>
                  <input
                    type="time"
                    value={formReminder}
                    onChange={(e) => setFormReminder(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="Pajak, Penting, Pribadi (pisahkan dengan koma)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={closeModal}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveNote}
                disabled={!formTitle.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary" />
                Panduan Catatan Pribadi
              </h2>
              <button onClick={() => setIsHelpModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">1. Mengelola Catatan</h3>
                <p>Gunakan tombol "Catatan Baru" untuk membuat pengingat atau agenda. Anda bisa mengedit atau menghapus catatan kapan saja.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">2. Kalender & Tanggal</h3>
                <p>Klik tanggal pada kalender di sidebar kiri untuk melihat catatan pada tanggal tersebut. Titik merah menandakan ada agenda.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">3. Kategori & Tag</h3>
                <p>Gunakan Tag untuk mengelompokkan catatan (misal: #Pajak, #Penting). Klik tag di sidebar untuk memfilter catatan.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">4. Pengingat</h3>
                <p>Atur waktu pengingat saat membuat catatan agar Anda tidak melewatkan tenggat waktu penting perpajakan.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
