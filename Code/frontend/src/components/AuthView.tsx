import React, { useState } from 'react';
import { 
  Server, 
  Shield, 
  Lock, 
  Mail, 
  User, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Scan, 
  Cpu, 
  Activity, 
  RefreshCw,
  X,
  BadgeCheck,
  Building2,
  Terminal,
  Check,
  Zap,
  Globe,
  Radio
} from 'lucide-react';
import { UserItem } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: UserItem) => void;
  onRegisterUser: (newUser: UserItem) => void;
  registeredUsers: UserItem[];
  onClose?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onRegisterUser,
  registeredUsers,
  onClose
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regDepartment, setRegDepartment] = useState('Data Hall Alpha - Zone 1');
  const [regRole, setRegRole] = useState<'Technician' | 'Viewer' | 'Admin'>('Technician');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAcceptPolicy, setRegAcceptPolicy] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccessMessage, setRegSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (role: 'Admin' | 'Technician' | 'Viewer') => {
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

    if (!regAcceptPolicy) {
      setRegError('Bạn cần đồng ý với Chính sách Bảo mật Hạ tầng AR-IMMS.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
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

      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        userId: generatedId,
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
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#080b0e] text-slate-200 flex flex-col justify-between font-sans selection:bg-[#f59e0b] selection:text-[#080b0e] relative overflow-hidden">
      {/* Atmosphere Grids & Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 terminal-grid opacity-60" />
        <div className="absolute left-[15%] top-[10%] h-[40vw] w-[40vw] rounded-full blur-3xl ambient-lamp" />
        <div className="absolute bottom-[10%] right-[10%] h-[35vw] w-[35vw] rounded-full bg-[#38bdf8]/5 blur-[120px]" />
      </div>

      {/* Top Cyber Navigation Bar */}
      <header className="relative z-10 px-6 py-4 bg-[#080b0e]/90 border-b border-[#222c37] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#38bdf8] text-[#080b0e] flex items-center justify-center font-mono font-bold text-xs shadow-lg shadow-sky-500/20">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wider text-white">CORE // AR-IMMS</span>
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#11161b] text-[#ffb03a] border border-[#222c37]">
                ENCLAVE AUTH
              </span>
            </div>
          </div>
        </div>

        {/* Quick Demo Access Bar & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">CHỌN NHANH:</span>
            <div className="flex items-center gap-1.5 border border-[#222c37] bg-[#11161b] p-1">
              <button
                onClick={() => handleQuickDemoLogin('Admin')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#161d24] hover:bg-[#38bdf8] hover:text-[#080b0e] text-[#38bdf8] transition-all cursor-pointer border border-[#222c37] flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Quản Trị</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('Technician')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#161d24] hover:bg-[#10b981] hover:text-[#080b0e] text-[#10b981] transition-all cursor-pointer border border-[#222c37] flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Kỹ Thuật</span>
              </button>
              <button
                onClick={() => handleQuickDemoLogin('Viewer')}
                className="px-2.5 py-1 text-xs font-mono font-bold bg-[#161d24] hover:bg-[#ffb03a] hover:text-[#080b0e] text-[#ffb03a] transition-all cursor-pointer border border-[#222c37] flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Giám Sát</span>
              </button>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-[#38bdf8]/40 bg-[#38bdf8]/10 hover:bg-[#38bdf8] hover:text-[#080b0e] text-[#38bdf8] font-mono text-xs uppercase font-bold transition-all flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Quay Lại</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-4xl border border-[#222c37] bg-[#080b0e] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          
          {/* Left Context & Feature Showcase Panel (Col 5) */}
          <div className="lg:col-span-5 bg-[#11161b]/80 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#222c37]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#161d24] border border-[#222c37] text-[#00f0ff] font-mono text-[10px] uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse text-[#00f0ff]" />
                Ma Trận Hạ Tầng
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Phân Khu Trung Tâm Dữ Liệu
              </h1>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Giám sát hạ tầng máy chủ trung tâm dữ liệu thời gian thực, đồng bộ bản sao số 3D và định vị tăng cường thực tế AR HUD.
              </p>

              {/* Status Box */}
              <div className="border border-[#222c37] bg-[#080b0e] p-4 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#222c37] text-slate-400">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Khu Vực Alpha-01
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">TRỰC TUYẾN</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border border-[#222c37] bg-[#11161b]">
                    <div className="text-slate-500 text-[10px]">Tủ Rack Hoạt Động</div>
                    <div className="text-white font-bold mt-0.5">14 / 14 Racks</div>
                  </div>
                  <div className="p-2 border border-[#222c37] bg-[#11161b]">
                    <div className="text-slate-500 text-[10px]">Nhiệt Độ TB</div>
                    <div className="text-emerald-400 font-bold mt-0.5">23.8°C (Chuẩn)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#222c37] text-[10px] font-mono text-slate-500 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>TLS 1.3 • FIDO2 • Nhật Ký Bất Biến</span>
            </div>
          </div>

          {/* Right Authentication Form (Col 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-[#080b0e]">
            {/* Segmented Switcher */}
            <div className="flex border border-[#222c37] bg-[#11161b] p-1 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); }}
                className={`flex-1 py-2 text-center transition-all cursor-pointer uppercase tracking-wider font-bold ${
                  authMode === 'login' 
                    ? 'bg-[#38bdf8] text-[#080b0e]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setRegError(null); }}
                className={`flex-1 py-2 text-center transition-all cursor-pointer uppercase tracking-wider font-bold ${
                  authMode === 'register' 
                    ? 'bg-[#38bdf8] text-[#080b0e]' 
                    : 'text-slate-400 hover:text-white'
                }`}
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
                  <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">
                    Email / ID Nhân Viên
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="sjenkins@ar-imms.corp hoặc TECH-8892"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-mono text-slate-400 uppercase">
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
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full keycap-glow bg-[#38bdf8] hover:bg-[#00f0ff] text-[#080b0e] py-3 text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Đang xác thực...' : 'Bắt Đầu Phiên Làm Việc →'}
                </button>
              </form>
            )}

            {/* REGISTER VIEW */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Đăng Ký Tài Khoản Kỹ Thuật</h2>
                  <p className="text-xs text-slate-400 font-light">Tạo tài khoản phân quyền để tiếp nhận ticket và quét AR.</p>
                </div>

                {regError && (
                  <div className="p-2.5 border border-rose-500/40 bg-rose-950/40 text-rose-300 font-mono text-xs">
                    {regError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Họ & Tên</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Email Công Vụ</label>
                    <input
                      type="email"
                      required
                      placeholder="user@ar-imms.corp"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Vai Trò</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                    >
                      <option value="Technician">Kỹ thuật viên (Technician)</option>
                      <option value="Viewer">Giám sát viên (Viewer)</option>
                      <option value="Admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Mã Nhân Viên (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="TECH-9912"
                      value={regEmployeeId}
                      onChange={(e) => setRegEmployeeId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Mật Khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase">Xác Nhận Mật Khẩu</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-[#11161b] border border-[#222c37] text-white font-mono text-xs focus:border-[#38bdf8] focus:outline-none"
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
    </div>
  );
};
