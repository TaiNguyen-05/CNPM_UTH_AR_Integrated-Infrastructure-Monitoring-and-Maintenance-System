import React, { useState } from 'react';
import { 
  Server, 
  Shield, 
  AlertCircle, 
  Cpu, 
  X, 
  Radio
} from 'lucide-react';
import { UserItem } from '../types';
import { arImmsApi } from '../services/api';

interface AuthViewProps {
  onLoginSuccess: (user: UserItem) => void;
  onRegisterUser: (newUser: UserItem) => void;
  registeredUsers: UserItem[];
  onClose?: () => void;
}

const GOOGLE_CLIENT_ID = '1088763447654-8mev68jsef27f3kfuc79juboivvbncb2.apps.googleusercontent.com';

// Reusable styling tokens (Giữ nguyên 100% thuộc tính CSS gốc)
const STYLES = {
  input: "w-full px-3.5 py-2.5 bg-black/35 backdrop-blur-xs border border-white/20 text-white font-mono text-xs focus:border-[#38bdf8] focus:bg-black/50 focus:outline-none rounded-lg placeholder:text-slate-500 shadow-inner",
  inputCompact: "w-full px-3 py-2 bg-black/35 backdrop-blur-xs border border-white/20 text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none rounded-lg",
  inputModal: "w-full px-3 py-2 bg-black/40 border border-white/15 text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none rounded-xl",
  label: "block text-xs font-mono text-slate-300 mb-1.5 uppercase font-bold",
  labelCompact: "block text-[10px] font-mono text-slate-300 mb-1 uppercase font-bold",
  btnSubmit: "w-full keycap-glow bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:opacity-50 mt-2 shadow-xl rounded-lg",
  btnGoogleSSO: "w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white/5 hover:bg-white/10 active:bg-white/15 backdrop-blur-md border border-white/15 hover:border-[#38bdf8]/60 text-slate-200 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-md rounded-xl group",
  tabBtn: "flex-1 py-2 text-center transition-all cursor-pointer uppercase tracking-wider font-bold rounded-lg",
  tabActive: "bg-[#38bdf8] text-[#080b0e] shadow-md",
  tabInactive: "text-slate-300 hover:text-white"
};

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onRegisterUser,
  registeredUsers,
  onClose
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regRole, setRegRole] = useState<'Technician' | 'Admin'>('Technician');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Modal States
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [pendingApprovalModalUser, setPendingApprovalModalUser] = useState<UserItem | null>(null);

  // Function xử lý tài khoản Google OAuth SSO
  const processGoogleAccount = async (cleanEmail: string, cleanName: string, avatarUrl?: string) => {
    setIsLoading(true);
    setGoogleNotice(null);

    try {
      const res = await arImmsApi.googleLogin({
        email: cleanEmail,
        full_name: cleanName,
        avatar: avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'
      });

      if (res && res.data) {
        const u = res.data;
        const mappedRole: 'Admin' | 'Technician' = (u.role || '').toUpperCase() === 'ADMIN' ? 'Admin' : 'Technician';
        const mappedStatus: 'Active' | 'Pending' | 'Locked' = 
          (u.status || '').toUpperCase() === 'APPROVED' ? 'Active' :
          (u.status || '').toUpperCase() === 'PENDING_APPROVAL' ? 'Pending' : 'Locked';

        const realUser: UserItem = {
          id: u.id,
          userId: u.id,
          name: u.full_name || cleanName,
          email: u.email || cleanEmail,
          role: mappedRole,
          status: mappedStatus,
          lastAuth: 'Google SSO (Đã xác thực)',
          initials: (u.full_name || cleanName).slice(0, 2).toUpperCase(),
          avatarUrl: u.avatar || avatarUrl
        };

        onRegisterUser(realUser);

        if (mappedStatus === 'Active') {
          setIsLoading(false);
          setShowGoogleModal(false);
          setPendingApprovalModalUser(null);
          onLoginSuccess(realUser);
          return;
        } else if (mappedStatus === 'Locked') {
          setIsLoading(false);
          setGoogleNotice('Tài khoản này đã bị Khóa bởi Quản trị viên.');
          return;
        } else {
          setIsLoading(false);
          setShowGoogleModal(false);
          setPendingApprovalModalUser(realUser);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Google backend sync error:', err);
    }

    // Local fallback nếu backend tạm thời không phản hồi
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    if (matchedUser) {
      if (matchedUser.status === 'Active') {
        setIsLoading(false);
        setShowGoogleModal(false);
        setPendingApprovalModalUser(null);
        onLoginSuccess({
          ...matchedUser,
          avatarUrl: avatarUrl || matchedUser.avatarUrl,
          lastAuth: 'Google SSO (Đã xác thực)'
        });
        return;
      } else if (matchedUser.status === 'Locked') {
        setIsLoading(false);
        setGoogleNotice('Tài khoản này đã bị Khóa bởi Quản trị viên.');
        return;
      } else {
        setIsLoading(false);
        setShowGoogleModal(false);
        setPendingApprovalModalUser(matchedUser);
        return;
      }
    }

    const newGoogleUser: UserItem = {
      id: `usr-gg-${Date.now()}`,
      userId: `TECH-${Math.floor(1000 + Math.random() * 9000)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'Technician',
      status: 'Pending',
      lastAuth: 'Đăng ký mới qua Google SSO',
      initials: cleanName.slice(0, 2).toUpperCase(),
      avatarUrl: avatarUrl || 'https://lh3.googleusercontent.com/a/default-user'
    };

    onRegisterUser(newGoogleUser);
    setIsLoading(false);
    setShowGoogleModal(false);
    setPendingApprovalModalUser(newGoogleUser);
  };

  // Google Identity Services One Tap / Prompt init
  React.useEffect(() => {
    try {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.id) {
        g.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response && response.credential) {
              try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const payload = JSON.parse(jsonPayload);
                const email = payload.email || '';
                const name = payload.name || payload.given_name || email.split('@')[0];
                const picture = payload.picture;
                if (email) {
                  processGoogleAccount(email.toLowerCase(), name, picture);
                }
              } catch (decodeErr) {
                console.error('Lỗi giải mã token Google:', decodeErr);
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    } catch (err) {
      console.warn('Google Identity SDK init note:', err);
    }
  }, [registeredUsers, authMode]);

  // Handle Google Auth Submit từ Modal
  const handleGoogleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanName = googleName.trim() || cleanEmail.split('@')[0];
    await processGoogleAccount(cleanEmail, cleanName);
  };

  // Trigger Google Login (Mở cửa sổ chọn tài khoản Google chính thức)
  const handleTriggerGoogleLogin = () => {
    setGoogleNotice(null);
    try {
      const g = (window as any).google;
      if (g && g.accounts && g.accounts.oauth2) {
        const client = g.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                setIsLoading(true);
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await res.json();
                if (profile && profile.email) {
                  await processGoogleAccount(
                    profile.email.toLowerCase(),
                    profile.name || profile.given_name || profile.email.split('@')[0],
                    profile.picture
                  );
                }
              } catch (err) {
                console.error('Lỗi lấy thông tin Google profile:', err);
                setShowGoogleModal(true);
              } finally {
                setIsLoading(false);
              }
            }
          },
          error_callback: (err: any) => {
            console.warn('OAuth popup error/closed:', err);
            if (err?.type === 'popup_closed' || err?.type === 'popup_blocked_by_browser') {
              setShowGoogleModal(true);
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      }
      
      // Fallback One-Tap nếu oauth2 chưa sẵn sàng
      if (g && g.accounts && g.accounts.id) {
        g.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
        return;
      }

      setShowGoogleModal(true);
    } catch (err) {
      console.warn('Lỗi kích hoạt Google OAuth:', err);
      setShowGoogleModal(true);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = (role: 'Admin' | 'Technician') => {
    setIsLoading(true);
    setLoginError(null);
    setTimeout(() => {
      const matched = registeredUsers.find(u => u.role === role && u.status === 'Active') 
        || registeredUsers.find(u => u.role === role) 
        || registeredUsers[0];
      
      if (matched) {
        onLoginSuccess({
          ...matched,
          status: 'Active',
          lastAuth: 'Just now (Demo)'
        });
      }
      setIsLoading(false);
    }, 300);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Vui lòng nhập email hoặc mã nhân viên.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu xác thực.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const matchedUser = registeredUsers.find(
        u => (u.email.toLowerCase() === loginEmail.trim().toLowerCase() || u.userId.toLowerCase() === loginEmail.trim().toLowerCase())
      );

      if (!matchedUser) {
        setIsLoading(false);
        setLoginError('Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại hoặc dùng phím Demo.');
        return;
      }

      if (matchedUser.status === 'Locked') {
        setIsLoading(false);
        setLoginError('Tài khoản này đã bị khóa quyền truy cập. Vui lòng liên hệ Quản trị viên.');
        return;
      }

      if (matchedUser.status === 'Pending') {
        setIsLoading(false);
        setLoginError('Tài khoản đang chờ xét duyệt phê duyệt từ Quản trị viên.');
        return;
      }

      setIsLoading(false);
      onLoginSuccess({
        ...matchedUser,
        lastAuth: 'Vừa đăng nhập'
      });
    }, 450);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim()) {
      setRegError('Vui lòng điền đầy đủ họ tên và email công vụ.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const existingUser = registeredUsers.find(
        u => u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );

      if (existingUser) {
        setIsLoading(false);
        setRegError('Email này đã được đăng ký trên hệ thống.');
        return;
      }

      const initials = regName.trim()
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const generatedId = regEmployeeId.trim() || `TECH-${Math.floor(2000 + Math.random() * 8000)}`;

      let dbId = `usr-${Date.now()}`;
      try {
        const roleBackend = regRole === 'Admin' ? 'ADMIN' : 'TECHNICIAN';
        const statusBackend = regRole === 'Admin' ? 'PENDING_APPROVAL' : 'APPROVED';
        const res = await arImmsApi.createUser({
          email: regEmail.trim(),
          full_name: regName.trim(),
          role: roleBackend,
          status: statusBackend,
          department: 'AR Maintenance Operations'
        });
        if (res && res.data && res.data.id) {
          dbId = res.data.id;
        }
      } catch (apiErr) {
        console.warn('Backend createUser note:', apiErr);
      }

      const newUser: UserItem = {
        id: dbId,
        userId: dbId,
        name: regName.trim(),
        email: regEmail.trim(),
        role: regRole,
        status: regRole === 'Admin' ? 'Pending' : 'Active',
        lastAuth: 'Vừa đăng ký (New)',
        initials
      };

      onRegisterUser(newUser);
      setIsLoading(false);

      if (regRole === 'Admin') {
        setRegSuccessMessage('Đăng ký tài khoản Quản trị thành công! Đang chờ xét duyệt.');
        setAuthMode('login');
        setLoginEmail(regEmail);
      } else {
        onLoginSuccess(newUser);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-200 flex flex-col justify-between font-sans selection:bg-[#f59e0b] selection:text-[#080b0e] relative overflow-hidden">
      {/* Background Parallax Video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="h-full w-full object-cover opacity-85 contrast-115 brightness-100 scale-105"
        >
          <source src="/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e]/90 via-black/30 to-[#080b0e]/70" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Atmosphere Grids & Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 terminal-grid opacity-20" />
        <div className="absolute left-[15%] top-[10%] h-[40vw] w-[40vw] rounded-full blur-3xl ambient-lamp opacity-30" />
      </div>

      {/* Top Cyber Navigation Bar */}
      <header className="relative z-10 px-6 py-4 bg-[#080b0e]/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#38bdf8] text-[#080b0e] flex items-center justify-center font-mono font-bold text-xs shadow-lg shadow-sky-500/30 rounded-lg">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wider text-white">CORE // AR-IMMS</span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-black/40 backdrop-blur-xs text-[#ffb03a] border border-white/10 rounded">
                ENCLAVE AUTH
              </span>
            </div>
          </div>
        </div>

        {/* Quick Demo Access Bar & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-300 font-mono font-bold drop-shadow">CHỌN NHANH DEMO:</span>
            <div className="flex items-center gap-1.5 border border-white/15 bg-black/40 backdrop-blur-md p-1 rounded-xl">
              <button
                onClick={() => handleQuickDemoLogin('Admin')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-[#38bdf8] hover:text-[#080b0e] text-[#38bdf8] transition-all cursor-pointer border border-white/10 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>👑 Quản Trị (Admin)</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('Technician')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-[#10b981] hover:text-[#080b0e] text-[#10b981] transition-all cursor-pointer border border-white/10 rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>🛠️ Kỹ Thuật (Tech)</span>
              </button>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#38bdf8]/40 bg-[#38bdf8]/10 hover:bg-[#38bdf8] hover:text-[#080b0e] text-[#38bdf8] font-mono text-xs uppercase font-bold transition-all flex items-center gap-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-4xl border border-white/20 bg-[#080b0e]/35 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* Left Context & Feature Showcase Panel (Col 5) */}
          <div className="lg:col-span-5 bg-white/[0.04] backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black/40 border border-white/15 text-[#00f0ff] font-mono text-[10px] uppercase tracking-wider rounded-md">
                <Radio className="w-3 h-3 animate-pulse text-[#00f0ff]" />
                Ma Trận Hạ Tầng
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-md">
                Phân Khu Trung Tâm Dữ Liệu
              </h1>
              <p className="text-xs text-slate-300 font-normal leading-relaxed drop-shadow">
                Giám sát hạ tầng máy chủ trung tâm dữ liệu thời gian thực, đồng bộ bản sao số 3D và định vị tăng cường thực tế AR HUD.
              </p>

              {/* Status Box */}
              <div className="border border-white/15 bg-black/30 backdrop-blur-xs p-4 space-y-2.5 font-mono text-xs rounded-xl shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-300">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Khu Vực Alpha-01
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">TRỰC TUYẾN</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border border-white/10 bg-white/[0.06] rounded-lg">
                    <div className="text-slate-400 text-[10px]">Tủ Rack Hoạt Động</div>
                    <div className="text-white font-bold mt-0.5">14 / 14 Racks</div>
                  </div>
                  <div className="p-2 border border-white/10 bg-white/[0.06] rounded-lg">
                    <div className="text-slate-400 text-[10px]">Nhiệt Độ TB</div>
                    <div className="text-emerald-400 font-bold mt-0.5">23.8°C (Chuẩn)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>TLS 1.3 • FIDO2 • Nhật Ký Bất Biến</span>
            </div>
          </div>

          {/* Right Authentication Form (Col 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-black/20 backdrop-blur-sm">
            {/* Segmented Switcher */}
            <div className="flex border border-white/15 bg-black/40 p-1 mb-6 font-mono text-xs rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); }}
                className={`${STYLES.tabBtn} ${authMode === 'login' ? STYLES.tabActive : STYLES.tabInactive}`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setRegError(null); }}
                className={`${STYLES.tabBtn} ${authMode === 'register' ? STYLES.tabActive : STYLES.tabInactive}`}
              >
                Đăng Ký
              </button>
            </div>

            {/* Success Banner */}
            {regSuccessMessage && (
              <div className="mb-4 p-3 border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs flex items-center justify-between">
                <span>{regSuccessMessage}</span>
                <button onClick={() => setRegSuccessMessage(null)}>✕</button>
              </div>
            )}

            {/* SIGN IN VIEW */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Xác Thực Danh Tính</h2>
                  <p className="text-xs text-slate-400 font-light mt-1">Đăng nhập tài khoản để vào bàn điều khiển trung tâm.</p>
                </div>

                {loginError && (
                  <div className="p-3 border border-rose-500/40 bg-rose-950/40 text-rose-300 font-mono text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className={STYLES.label}>
                    Email / ID Nhân Viên
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="sjenkins@ar-imms.corp hoặc TECH-8892"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={STYLES.input}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className={STYLES.label}>
                      Mật Khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-[11px] font-mono text-[#38bdf8] hover:underline"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={STYLES.input}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={STYLES.btnSubmit}
                >
                  {isLoading ? 'Đang xác thực...' : 'Bắt Đầu Phiên Làm Việc →'}
                </button>

                {/* Google Sign-In Button */}
                <div className="relative my-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
                  <span className="relative bg-black/40 px-2 text-[10px] font-mono uppercase text-slate-300 rounded">Hoặc tiếp tục với</span>
                </div>

                <div className="w-full pt-0.5">
                  <button
                    type="button"
                    onClick={handleTriggerGoogleLogin}
                    className={STYLES.btnGoogleSSO}
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Đăng Nhập Bằng Google SSO</span>
                  </button>
                </div>
              </form>
            )}

            {/* REGISTER VIEW */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Đăng Ký Tài Khoản Kỹ Thuật</h2>
                  <p className="text-xs text-slate-300 font-light">Tạo tài khoản phân quyền để tiếp nhận ticket và quét AR.</p>
                </div>

                {regError && (
                  <div className="p-2.5 border border-rose-500/40 bg-rose-950/60 text-rose-300 font-mono text-xs rounded-lg">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={STYLES.labelCompact}>Họ & Tên</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className={STYLES.inputCompact}
                    />
                  </div>
                  <div>
                    <label className={STYLES.labelCompact}>Email Công Vụ</label>
                    <input
                      type="email"
                      required
                      placeholder="user@ar-imms.corp"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className={STYLES.inputCompact}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={STYLES.labelCompact}>Vai Trò Đăng Ký</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-black/40 backdrop-blur-xs border border-white/20 text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none rounded-lg"
                    >
                      <option value="Technician" className="bg-[#080b0e]">🛠️ Kỹ thuật viên (Technician)</option>
                      <option value="Admin" className="bg-[#080b0e]">👑 Quản trị viên (Admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className={STYLES.labelCompact}>Mã Nhân Viên (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="TECH-9912"
                      value={regEmployeeId}
                      onChange={(e) => setRegEmployeeId(e.target.value)}
                      className={STYLES.inputCompact}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={STYLES.labelCompact}>Mật Khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className={STYLES.inputCompact}
                    />
                  </div>
                  <div>
                    <label className={STYLES.labelCompact}>Xác Nhận Mật Khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className={STYLES.inputCompact}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full keycap-glow bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] py-2.5 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer mt-2"
                >
                  {isLoading ? 'Đang tạo...' : 'Đăng Ký Tài Khoản Hệ Thống'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="border border-[#222c37] bg-[#080b0e] max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-[#222c37]">
              <span className="font-mono text-xs font-bold uppercase text-[#38bdf8]">Khôi Phục Mật Khẩu</span>
              <button onClick={() => setShowForgotPasswordModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Vui lòng liên hệ trực tiếp Quản trị viên phòng máy hoặc sử dụng tài khoản Demo được cấp sẵn.
            </p>
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full bg-[#161d24] border border-[#222c37] text-white py-2 text-xs font-mono uppercase hover:bg-[#38bdf8] hover:text-[#080b0e] transition-colors"
            >
              Quay Lại
            </button>
          </div>
        </div>
      )}

      {/* Google OAuth Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative border border-white/15 bg-[#080d16]/90 backdrop-blur-2xl max-w-md w-full p-6 space-y-4 shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-mono text-xs font-bold uppercase text-white tracking-wide">Xác Thực Google OAuth SSO</span>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {googleNotice ? (
              <div className="space-y-4">
                <div className="p-3 bg-sky-950/40 border border-sky-500/40 text-sky-200 text-xs font-mono leading-relaxed rounded-xl">
                  {googleNotice}
                </div>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="w-full bg-[#38bdf8] text-[#080b0e] py-2.5 text-xs font-mono font-bold uppercase hover:bg-[#00f0ff] transition-all cursor-pointer rounded-xl"
                >
                  Đã Hiểu & Đóng
                </button>
              </div>
            ) : (
              <form onSubmit={handleGoogleAuthSubmit} className="space-y-3.5">
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  Đăng nhập bằng hòm thư Gmail của bạn để đăng ký làm Kỹ Thuật Viên. Admin sẽ duyệt và hệ thống tự động gửi email cảnh báo khi phòng máy có sự cố.
                </p>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 uppercase font-bold">Địa Chỉ Gmail (*)</label>
                  <input
                    type="email"
                    required
                    placeholder="kithuatvien.datacenter@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className={STYLES.inputModal}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 uppercase font-bold">Họ Và Tên (Kỹ thuật viên)</label>
                  <input
                    type="text"
                    placeholder="VD: Trần Văn Bình"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    className={STYLES.inputModal}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 bg-white/5 border border-white/10 text-slate-300 py-2.5 text-xs font-mono uppercase hover:text-white rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] py-2.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-md rounded-xl disabled:opacity-50"
                  >
                    {isLoading ? 'Đang xác thực...' : 'Tiếp Tục →'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Pending Approval Modal (Chờ Admin phê duyệt) */}
      {pendingApprovalModalUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative border border-amber-500/30 bg-[#080d16]/85 backdrop-blur-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 shadow-[0_0_60px_rgba(245,158,11,0.18)] rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.2)] shrink-0">
                  <span className="text-2xl animate-pulse">⏳</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white tracking-wide">
                      Tài Khoản Chờ Phê Duyệt
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Pending
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Hệ thống đang chờ Quản trị viên kích hoạt tài khoản</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingApprovalModalUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng"
              >
                ✕
              </button>
            </div>

            {/* User Info Card */}
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4.5 space-y-3 backdrop-blur-md">
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/30 to-cyan-500/30 border border-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {pendingApprovalModalUser.name ? pendingApprovalModalUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate">{pendingApprovalModalUser.name}</p>
                  <p className="text-xs text-[#38bdf8] font-mono truncate">{pendingApprovalModalUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[11px] text-slate-400 block mb-1">Vai Trò Đăng Ký</span>
                  <span className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    🛠️ {pendingApprovalModalUser.role}
                  </span>
                </div>
                <div className="bg-black/30 border border-white/5 rounded-lg p-2.5">
                  <span className="text-[11px] text-slate-400 block mb-1">Trạng Thái</span>
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    Chờ Xét Duyệt
                  </span>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl text-slate-300 text-xs leading-relaxed space-y-1.5 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <span>🛡️</span>
                <span>Chính sách kiểm soát truy cập</span>
              </div>
              <p className="text-slate-300 text-[11.5px]">
                Để bảo vệ an toàn hạ tầng máy chủ và hệ thống cảm biến AR, tài khoản kỹ thuật viên mới cần được <strong className="text-white">Admin phê duyệt</strong> trước khi đăng nhập và thao tác.
              </p>
              <p className="text-[11px] text-slate-400">
                ✉️ Bạn sẽ nhận được thông báo qua Email khi tài khoản được kích hoạt thành công.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingApprovalModalUser(null)}
                className="sm:w-1/3 py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer text-center"
              >
                Đóng / Quay Lại
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingApprovalModalUser(null);
                  handleQuickDemoLogin('Admin');
                }}
                className="sm:w-2/3 py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-sky-500 hover:from-cyan-300 hover:to-sky-400 text-[#070d14] font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>🔑</span>
                <span>Đăng Nhập Admin Để Duyệt →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
