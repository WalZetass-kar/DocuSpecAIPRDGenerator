import React from 'react';
import { Users, Mail, UserPlus, Shield, Check, X, Copy, Trash2, Send, Clock, AlertCircle, MessageCircle, ChevronDown, Edit2, Crown } from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Invited' | 'Active';
  invitedAt: string;
  avatar: string;
  isOwner?: boolean;
}

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; email: string; role?: string } | null;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'members' | 'activity'>('members');
  const [activityLog] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('docuspec_team_activity') || '[]'); } catch { return []; }
  });

  const ownerMember: TeamMember = {
    id: 'owner-main',
    name: currentUser?.name || 'M. Ihwal Maulana',
    email: currentUser?.email || 'ihwal@example.com',
    role: 'Admin',
    status: 'Active',
    invitedAt: 'Pemilik Workspace',
    avatar: (currentUser?.name || 'M Ihwal')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    isOwner: true,
  };

  const [members, setMembers] = React.useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('docuspec_team_members_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(
            (m) =>
              m &&
              !m.isOwner &&
              m.email &&
              !['sarah@example.com', 'rian@example.com', 'devi@example.com'].includes(m.email)
          );
          return [ownerMember, ...filtered];
        }
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
    return [ownerMember];
  });

  React.useEffect(() => {
    try {
      const invitedOnly = members.filter((m) => !m.isOwner);
      localStorage.setItem('docuspec_team_members_v2', JSON.stringify(invitedOnly));
    } catch (err) {
      console.error('Failed to save team members:', err);
    }
  }, [members]);

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailTrimmed = inviteEmail.trim().toLowerCase();

    if (!emailTrimmed || !emailTrimmed.includes('@') || !emailTrimmed.includes('.')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === emailTrimmed)) {
      setErrorMessage('Email ini sudah terdaftar atau diundang dalam tim.');
      return;
    }

    const namePart = emailTrimmed.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const initials = namePart.substring(0, 2).toUpperCase();

    const newMember: TeamMember = {
      id: `m-${Date.now()}`,
      email: emailTrimmed,
      name: formattedName,
      role: inviteRole,
      status: 'Invited',
      invitedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      avatar: initials,
      isOwner: false,
    };

    setMembers((prev) => [...prev, newMember]);

    // Save to activity log
    const log = JSON.parse(localStorage.getItem('docuspec_team_activity') || '[]');
    log.unshift({ action: `Mengundang ${emailTrimmed} sebagai ${inviteRole}`, time: new Date().toISOString() });
    localStorage.setItem('docuspec_team_activity', JSON.stringify(log.slice(0, 20)));

    setInviteEmail('');
    setSuccessMessage(`✅ Undangan berhasil dikirim ke ${emailTrimmed}`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSendWhatsApp = () => {
    if (!inviteEmail.trim()) { setErrorMessage('Masukkan email dulu.'); return; }
    const inviteUrl = `${window.location.origin}/invite/ws-product-engineering`;
    const msg = encodeURIComponent(`Halo! Anda diundang untuk berkolaborasi di workspace DocuSpec AI sebagai *${inviteRole}*.\n\nKlik tautan berikut untuk bergabung: ${inviteUrl}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleChangeRole = (id: string, newRole: 'Admin' | 'Editor' | 'Viewer') => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: newRole } : m));
    setEditingRoleId(null);
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id || m.isOwner));
  };

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/ws-product-engineering`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const invitedMembers = members.filter((m) => !m.isOwner);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200 text-xs font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200  dark:border-gray-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gray-50/50 dark:bg-black/50">
          <div className="w-10 h-10 rounded-2xl bg-[#B11226]/10 text-[#B11226] flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 dark:text-white text-sm">
              Undang & Kelola Anggota Tim
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
              Workspace: <span className="font-semibold text-gray-700 dark:text-gray-300">Product Engineering</span>
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Invite Form */}
          <div className="space-y-2">
            <label className="font-bold text-gray-900 dark:text-white text-xs block">
              Undang Anggota Baru via Email
            </label>
            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => {
                    setInviteEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="rekan@perusahaan.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-[#B11226]/50 outline-none transition-all"
                />
              </div>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Editor' | 'Viewer')}
                className="px-3 py-2.5 rounded-2xl border border-gray-200  dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-medium outline-none cursor-pointer"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#B11226] hover:bg-[#900E1F] transition-colors text-white font-bold rounded-2xl shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Undang</span>
              </button>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-2.5 bg-[#25D366] hover:bg-[#1EBF5A] text-white font-bold rounded-2xl shrink-0 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                title="Kirim undangan via WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Error or Success Toast Banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-[11px] flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-2 animate-in fade-in">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          {/* Workspace Owner Section */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider block">
              Pemilik Workspace
            </span>
            <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl border border-gray-200  dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B11226] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {ownerMember.avatar}
                </div>
                <div>
                  <span className="font-extrabold text-gray-900 dark:text-white block">
                    {ownerMember.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                    {ownerMember.email}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/60 text-[#B11226] dark:text-red-400 font-bold text-[10px]">
                Pemilik
              </span>
            </div>
          </div>

          {/* Invited Team Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-gray-400 tracking-wider">
                Tim Terundang ({invitedMembers.length})
              </span>
            </div>

            {invitedMembers.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/50 space-y-2">
                <Mail className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 font-medium text-xs">Belum ada anggota tim yang diundang.</p>
                <p className="text-gray-400 text-[11px] max-w-xs mx-auto">Ketikkan alamat email rekan kerja Anda di formulir di atas untuk memberikan akses kolaborasi PRD.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                {invitedMembers.map((m) => (
                  <div key={m.id} className="p-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold text-xs flex items-center justify-center shrink-0">
                          {m.avatar}
                        </div>
                        {/* Online/Pending indicator */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${m.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white block truncate">{m.name}</span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="truncate">{m.email}</span>
                          <span>•</span>
                          <span className={`flex items-center gap-1 font-medium ${m.status === 'Active' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            <Clock className="w-3 h-3" /> {m.status === 'Active' ? 'Aktif' : `Terundang ${m.invitedAt}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {/* Role dropdown inline */}
                      <div className="relative">
                        {editingRoleId === m.id ? (
                          <div className="flex gap-1">
                            {(['Admin', 'Editor', 'Viewer'] as const).map(r => (
                              <button key={r} onClick={() => handleChangeRole(m.id, r)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-colors ${
                                  m.role === r ? 'bg-[#B11226] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}>{r}</button>
                            ))}
                            <button onClick={() => setEditingRoleId(null)} className="p-0.5 text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingRoleId(m.id)}
                            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[10px] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            {m.role} <ChevronDown className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy Shareable Invite Link */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200  dark:border-gray-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 min-w-0">
              <Shield className="w-4 h-4 text-[#B11226] shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block text-gray-900 dark:text-white text-xs">
                  Tautan Undangan Tim
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  Siapa pun dengan tautan ini dapat bergabung sebagai Viewer
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyInvite}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200  dark:border-gray-700 rounded-2xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>{copiedLink ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

