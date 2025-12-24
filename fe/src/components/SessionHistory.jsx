// Session History Component - Hiển thị danh sách sessions

import { useState } from 'react';
import { History, Plus, Trash2, MessageSquare, X } from 'lucide-react';
import { formatChatTime } from '../utils/chatUtils';

export function SessionHistory({
    sessions,
    currentSessionId,
    onSelectSession,
    onCreateSession,
    onDeleteSession,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const handleDelete = (e, sessionId) => {
        e.stopPropagation();
        if (deleteConfirm === sessionId) {
            onDeleteSession(sessionId);
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(sessionId);
            // Reset after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const handleSelectSession = (sessionId) => {
        onSelectSession(sessionId);
        setIsOpen(false);
    };

    const handleCreateSession = async () => {
        await onCreateSession();
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={ () => setIsOpen(true) }
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
                title="Session History"
            >
                <History className="h-5 w-5" />
            </button>
        );
    }

    return (
        <div className="absolute top-12 right-0 z-10 w-80 max-h-96 overflow-hidden rounded-xl border border-white/20 bg-slate-900/98 backdrop-blur-xl shadow-2xl">
            {/* Header */ }
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-slate-100">Lịch sử chat</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={ handleCreateSession }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-green-400 transition-colors"
                        title="Tạo session mới"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    <button
                        onClick={ () => setIsOpen(false) }
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors"
                        title="Đóng"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Sessions List */ }
            <div className="max-h-80 overflow-y-auto">
                { sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                        <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                        <p className="text-sm">Chưa có session nào</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        { sessions.map((session) => (
                            <div
                                key={ session.id }
                                onClick={ () => handleSelectSession(session.id) }
                                className={ `flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${session.id === currentSessionId
                                    ? 'bg-blue-500/20 border-l-2 border-blue-400'
                                    : 'hover:bg-white/5'
                                    }` }
                            >
                                <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-200 font-medium truncate">
                                        { session.title || 'New Chat' }
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">
                                            { session.messageCount || 0 } tin nhắn
                                        </span>
                                        <span className="text-xs text-slate-500">•</span>
                                        <span className="text-xs text-slate-500">
                                            { formatChatTime(session.updatedAt) }
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={ (e) => handleDelete(e, session.id) }
                                    className={ `flex-shrink-0 rounded p-1 transition-colors ${deleteConfirm === session.id
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'text-slate-500 hover:bg-red-500/10 hover:text-red-400'
                                        }` }
                                    title={ deleteConfirm === session.id ? 'Nhấn lại để xác nhận' : 'Xóa session' }
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )) }
                    </div>
                ) }
            </div>
        </div>
    );
}
