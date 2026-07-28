import React from 'react';
import { X, MessageSquare, Send, CheckCircle2, Trash2 } from 'lucide-react';
import { CommentItem, PRDDocument } from '../types';

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prd: PRDDocument;
  onUpdatePRD: (updated: PRDDocument) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  isOpen,
  onClose,
  prd,
  onUpdatePRD,
}) => {
  const [comments, setComments] = React.useState<CommentItem[]>(prd.comments || []);
  const [newCommentText, setNewCommentText] = React.useState('');

  React.useEffect(() => {
    setComments(prd.comments || []);
  }, [prd.comments]);

  if (!isOpen) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-${Date.now()}`,
      author: 'Senior Product Manager',
      avatar: 'PM',
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    const updated = [newComment, ...comments];
    setComments(updated);
    onUpdatePRD({ ...prd, comments: updated });
    setNewCommentText('');
  };

  const handleToggleResolve = (id: string) => {
    const updated = comments.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c));
    setComments(updated);
    onUpdatePRD({ ...prd, comments: updated });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-gray-900 border-l border-gray-200  dark:border-gray-800 shadow-2xl p-6 flex flex-col justify-between custom-scrollbar animate-slide-left text-xs font-sans text-gray-900 dark:text-gray-100">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100/10 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#B11226]" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Komentar & Diskusi Tim</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment list */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {comments.length === 0 ? (
            <div className="py-8 text-center text-gray-400 space-y-1">
              <MessageSquare className="w-8 h-8 mx-auto text-gray-300" />
              <p className="font-semibold">Belum ada komentar.</p>
              <p className="text-[11px]">Tulis komentar pertama Anda di bawah.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-2xl border ${
                  c.resolved
                    ? 'bg-gray-50 dark:bg-gray-800/40 opacity-60 border-gray-200 '
                    : 'bg-white dark:bg-gray-800 border-gray-200  dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#B11226] text-white flex items-center justify-center font-bold text-[10px]">
                      {c.avatar || 'U'}
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-xs">{c.author}</span>
                  </div>
                  <button
                    onClick={() => handleToggleResolve(c.id)}
                    className="text-[10px] text-gray-400 hover:text-emerald-500 font-semibold"
                  >
                    {c.resolved ? '● Selesai' : 'Tandai Selesai'}
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px] font-sans">
                  {c.text}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleAddComment} className="pt-4 border-t border-gray-100/10 dark:border-gray-800 space-y-2">
        <textarea
          rows={2}
          placeholder="Tulis komentar atau instruksi tim..."
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          className="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-[#B11226]"
        />
        <button
          type="submit"
          className="w-full py-2.5 bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Kirim Komentar</span>
        </button>
      </form>
    </div>
  );
};
