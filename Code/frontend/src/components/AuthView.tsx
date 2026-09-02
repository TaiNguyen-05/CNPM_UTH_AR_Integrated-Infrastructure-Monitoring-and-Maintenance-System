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
  Globe
} from 'lucide-react';
import { UserItem } from '../types';
import { MOCK_RACK_ISOMETRIC } from '../data/mockData';

interface AuthViewProps {
  onLoginSuccess: (user: UserItem) => void;
  onRegisterUser: (newUser: UserItem) => void;
  registeredUsers: UserItem[];
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onRegisterUser,
  registeredUsers
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
          lastAuth: 'Vừa đăng nhập (Just now)'
        });
      }
      setIsLoading(false);
    }, 350);
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim()) {
      setLoginError('Vui lòng nhập địa chỉ email hoặc mã nhân viên.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Vui lòng nhập mật khẩu xác thực.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanInput = loginEmail.trim().toLowerCase();
      const existing = registeredUsers.find(
        u => u.email.toLowerCase() === cleanInput || u.userId.toLowerCase() === cleanInput
      );

      if (existing) {
        if (existing.status === 'Locked') {
          setLoginError('Tài khoản này đang bị tạm khóa an ninh. Vui lòng liên hệ quản trị viên.');
          setIsLoading(false);
          return;
        }

        onLoginSuccess({
          ...existing,
          lastAuth: 'Vừa đăng nhập (Just now)'
        });
      } else {
        const initials = loginEmail
          .split('@')[0]
          .split('.')
          .map(s => s[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'US';

        const dynamicUser: UserItem = {
          id: `usr-${Date.now()}`,
          userId: `TECH-${Math.floor(1000 + Math.random() * 9000)}`,
          name: loginEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: loginEmail.includes('@') ? loginEmail : `${loginEmail}@ar-imms.corp`,
          role: 'Technician',
          status: 'Active',
          lastAuth: 'Vừa đăng nhập (Just now)',
          initials
        };

        onRegisterUser(dynamicUser);
        onLoginSuccess(dynamicUser);
      }
      setIsLoading(false);
    }, 450);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccessMessage(null);

    if (!regName.trim()) {
      setRegError('Vui lòng nhập đầy đủ họ và tên.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Mật khẩu bảo mật phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    if (!regAcceptPolicy) {
      setRegError('Vui lòng chấp thuận các quy định an toàn vận hành hệ thống.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const emailExists = registeredUsers.some(
        u => u.email.toLowerCase() === regEmail.trim().toLowerCase()
      );

      if (emailExists) {
        setRegError('Email này đã được sử dụng. Vui lòng đăng nhập.');
        setIsLoading(false);
        return;
      }

      const initials = regName
        .trim()
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
        setRegSuccessMessage('Đăng ký tài khoản Quản trị thành công! Hệ thống đang chờ xét duyệt.');
        setAuthMode('login');
        setLoginEmail(regEmail);
      } else {
        onLoginSuccess(newUser);
      }
    }, 550);
  };

  // Password Strength Meter
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 33, label: 'Yếu', color: 'bg-rose-500' };
    if (score <= 4) return { score: 66, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 100, label: 'Rất an toàn', color: 'bg-emerald-600' };
  };

  const passStrength = getPasswordStrength(regPassword);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col justify-between font-sans selection:bg-[#dbeafe] selection:text-[#1d4ed8]">
      
      {/* Clean Top Navigation Bar */}
      <header className="px-6 py-4 bg-white border-b border-[#e2e8f0] flex items-center justify-between shadow-xs sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0058be] flex items-center justify-center text-white shadow-sm">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#0f172a] tracking-tight">AR-IMMS</span>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                Hệ Thống Vận Hành
              </span>
            </div>
            <p className="text-xs text-[#64748b] hidden sm:block">Giám Sát Hạ Tầng & Bảo Trì Trung Tâm Dữ Liệu</p>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748b] hidden md:inline font-medium">Tài khoản demo:</span>
          <div className="flex items-center gap-1.5 bg-[#f1f5f9] p-1 rounded-lg border border-[#e2e8f0]">
            <button
              onClick={() => handleQuickDemoLogin('Admin')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-[#e0e7ff] text-[#1e40af] transition-all cursor-pointer shadow-xs border border-[#cbd5e1]/60 flex items-center gap-1.5"
              title="Đăng nhập với quyền Quản Trị Viên"
            >
              <Shield className="w-3.5 h-3.5 text-[#0058be]" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('Technician')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-[#dcfce7] text-[#15803d] transition-all cursor-pointer shadow-xs border border-[#cbd5e1]/60 flex items-center gap-1.5"
              title="Đăng nhập với quyền Kỹ Thuật Viên"
            >
              <Cpu className="w-3.5 h-3.5 text-[#00855b]" />
              <span>Kỹ thuật viên</span>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('Viewer')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-[#f1f5f9] text-[#475569] transition-all cursor-pointer shadow-xs border border-[#cbd5e1]/60 flex items-center gap-1.5"
              title="Đăng nhập với quyền Giám Sát Viên"
            >
              <Activity className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Giám sát</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto">
        <div className="w-full max-w-5xl bg-white rounded-2xl border border-[#e2e8f0] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
          
          {/* Left Context & Feature Showcase Panel (Col 5) */}
          <div className="lg:col-span-5 bg-[#f8fafc] p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#e2e8f0]">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[#1d4ed8] text-xs font-semibold mb-4">
                <Scan className="w-3.5 h-3.5 text-[#0058be]" />
                Không Gian Số Hóa & AR Marker
              </div>

              <h1 className="text-2xl font-bold text-[#0f172a] leading-tight mb-2">
                Hạ Tầng Máy Chủ Thông Minh
              </h1>
              <p className="text-sm text-[#64748b] leading-relaxed mb-6">
                Giải pháp giám sát nhiệt độ, tải điện tử và linh kiện theo thời gian thực kết hợp kính thông minh AR DataMatrix.
              </p>

              {/* Status card */}
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
                    <span className="w-2 h-2 rounded-full bg-[#00855b] animate-pulse" />
                    Data Hall Alpha - Phòng Máy 01
                  </div>
                  <span className="text-[11px] font-semibold text-[#00855b] bg-[#dcfce7] px-2 py-0.5 rounded">
                    Hoạt động bình thường
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9]">
                    <div className="text-[#64748b] text-[11px]">Tủ Rack Trực Tuyến</div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">18 / 18 Rack</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9]">
                    <div className="text-[#64748b] text-[11px]">Nhiệt Độ Trung Bình</div>
                    <div className="text-sm font-bold text-[#00855b] mt-0.5">23.8°C</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9]">
                    <div className="text-[#64748b] text-[11px]">Định Vị Không Gian</div>
                    <div className="text-sm font-bold text-[#0058be] mt-0.5">6-DoF SLAM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#f8fafc] border border-[#f1f5f9]">
                    <div className="text-[#64748b] text-[11px]">Bảo Mật Truy Cập</div>
                    <div className="text-sm font-bold text-[#0f172a] mt-0.5">FIDO2 / MFA</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="pt-6 border-t border-[#e2e8f0] mt-6 flex items-center gap-2 text-xs text-[#64748b]">
              <Shield className="w-4 h-4 text-[#0058be] shrink-0" />
              <span>Chứng chỉ an toàn thông tin & kiểm toán nhật ký vận hành</span>
            </div>
          </div>

          {/* Right Authentication Form (Col 7) */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
            
            {/* Clean Segmented Tab Switcher */}
            <div className="flex bg-[#f1f5f9] p-1 rounded-xl border border-[#e2e8f0] mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setLoginError(null); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'login' 
                    ? 'bg-white text-[#0058be] shadow-sm font-bold' 
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setRegError(null); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  authMode === 'register' 
                    ? 'bg-white text-[#0058be] shadow-sm font-bold' 
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Đăng Ký Tài Khoản</span>
              </button>
            </div>

            {/* Success Banner */}
            {regSuccessMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" />
                <div className="flex-1 font-medium">{regSuccessMessage}</div>
                <button onClick={() => setRegSuccessMessage(null)} className="text-[#059669] hover:text-[#065f46]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* ========================================== */}
            {/* SIGN IN VIEW */}
            {/* ========================================== */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">Chào mừng bạn trở lại</h2>
                  <p className="text-xs text-[#64748b] mt-1">Đăng nhập tài khoản của bạn để truy cập trung tâm giám sát.</p>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
                    <span className="font-medium">{loginError}</span>
                  </div>
                )}

                {/* Email or ID */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1.5">
                    Email công vụ hoặc Mã nhân viên
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="sjenkins@ar-imms.corp hoặc TECH-8892"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0058be] focus:ring-3 focus:ring-[#0058be]/10 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#334155]">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(true)}
                      className="text-xs text-[#0058be] hover:underline cursor-pointer font-medium"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94a3b8]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#cbd5e1] rounded-xl text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#0058be] focus:ring-3 focus:ring-[#0058be]/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94a3b8] hover:text-[#334155] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#cbd5e1] text-[#0058be] focus:ring-[#0058be]"
                    />
                    <span>Ghi nhớ đăng nhập trên thiết bị này</span>
                  </label>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0058be] hover:bg-[#2170e4] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang kiểm tra thông tin...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng Nhập Vào Hệ Thống</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Select Profile Pills */}
                <div className="pt-3 border-t border-[#f1f5f9]">
                  <div className="text-[11px] text-[#64748b] text-center mb-2">
                    Hoặc chọn nhanh tài khoản mẫu:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => { setLoginEmail('sjenkins@ar-imms.corp'); setLoginPassword('admin123'); }}
                      className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#eff6ff] border border-[#e2e8f0] text-left transition-colors cursor-pointer text-xs"
                    >
                      <div className="font-bold text-[#0f172a] truncate">Sarah Jenkins</div>
                      <div className="text-[11px] text-[#0058be] truncate">Quản trị viên</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginEmail('rking@ar-imms.corp'); setLoginPassword('tech123'); }}
                      className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#f0fdf4] border border-[#e2e8f0] text-left transition-colors cursor-pointer text-xs"
                    >
                      <div className="font-bold text-[#0f172a] truncate">Robert King</div>
                      <div className="text-[11px] text-[#00855b] truncate">Kỹ thuật viên</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginEmail('mchen@ar-imms.corp'); setLoginPassword('viewer123'); }}
                      className="p-2 rounded-lg bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] text-left transition-colors cursor-pointer text-xs"
                    >
                      <div className="font-bold text-[#0f172a] truncate">M. Chen</div>
                      <div className="text-[11px] text-[#475569] truncate">Giám sát viên</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ========================================== */}
            {/* REGISTER VIEW */}
            {/* ========================================== */}
            {authMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <h2 className="text-xl font-bold text-[#0f172a]">Tạo tài khoản mới</h2>
                  <p className="text-xs text-[#64748b] mt-1">Đăng ký thông tin kỹ thuật viên để phân quyền truy cập hạ tầng.</p>
                </div>

                {regError && (
                  <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-[#dc2626]" />
                    <span className="font-medium">{regError}</span>
                  </div>
                )}

                {/* Name & ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Họ và Tên
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Nguyễn Văn An"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Mã Nhân Viên (Tùy chọn)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                        <Terminal className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        placeholder="TECH-5521"
                        value={regEmployeeId}
                        onChange={(e) => setRegEmployeeId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#334155] mb-1">
                    Email Công Vụ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="vanan.nguyen@ar-imms.corp"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    />
                  </div>
                </div>

                {/* Department & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Phòng Máy / Khu Vực
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    >
                      <option value="Data Hall Alpha - Zone 1">Data Hall Alpha (Khu 1)</option>
                      <option value="Data Hall Beta - Zone 2">Data Hall Beta (Khu 2)</option>
                      <option value="Network Core Sector">Khu Vực Mạng Lõi (Core)</option>
                      <option value="Power & Cooling Unit">Hệ Thống Điện & Làm Mát</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Vai Trò Phân Quyền
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    >
                      <option value="Technician">Kỹ thuật viên (Bảo trì & AR)</option>
                      <option value="Viewer">Giám sát viên (Chỉ xem Telemetry)</option>
                      <option value="Admin">Quản trị viên (Cần phê duyệt)</option>
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Mật Khẩu Khởi Tạo
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Ít nhất 6 ký tự"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#334155] mb-1">
                      Nhập Lại Mật Khẩu
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Xác nhận mật khẩu"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-xl text-xs sm:text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    />
                  </div>
                </div>

                {/* Password Strength */}
                {regPassword && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#64748b]">
                      <span>Độ an toàn mật khẩu:</span>
                      <span className="font-semibold text-[#0f172a]">{passStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Agreement */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 text-xs text-[#475569] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regAcceptPolicy}
                      onChange={(e) => setRegAcceptPolicy(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-[#cbd5e1] text-[#0058be] focus:ring-[#0058be]"
                    />
                    <span>
                      Tôi đồng ý với quy trình bảo mật và an toàn vận hành trung tâm dữ liệu.
                    </span>
                  </label>
                </div>

                {/* Register Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#00855b] hover:bg-[#00a870] text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang tạo tài khoản...</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      <span>Hoàn Tất Đăng Ký & Đăng Nhập</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Forgot Password Light Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl w-full max-w-md overflow-hidden text-[#0f172a]">
            <div className="px-6 py-4 bg-[#f8fafc] border-b border-[#e2e8f0] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#0058be]" />
                <h3 className="font-bold text-base text-[#0f172a]">Khôi Phục Mật Khẩu</h3>
              </div>
              <button 
                onClick={() => { setShowForgotPasswordModal(false); setResetSuccess(false); }}
                className="p-1 rounded-full text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {resetSuccess ? (
                <div className="p-4 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#059669]" />
                  <div className="font-bold text-sm text-[#0f172a]">Đã Gửi Hướng Dẫn Khôi Phục!</div>
                  <p className="text-xs text-[#475569]">
                    Một liên kết thiết lập lại mật khẩu đã được gửi tới <strong>{resetEmail}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                  </p>
                  <button
                    onClick={() => { setShowForgotPasswordModal(false); setResetSuccess(false); }}
                    className="mt-2 px-4 py-2 bg-[#0058be] text-white font-bold rounded-lg hover:bg-[#2170e4]"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[#64748b] leading-relaxed">
                    Nhập địa chỉ email công vụ đã đăng ký để nhận mã OTP hoặc liên kết tạo lại mật khẩu mới.
                  </p>
                  <div>
                    <label className="block font-semibold text-[#334155] mb-1">Địa chỉ Email</label>
                    <input
                      type="email"
                      required
                      placeholder="technician@ar-imms.corp"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded-lg text-sm text-[#0f172a] focus:outline-none focus:border-[#0058be]"
                    />
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPasswordModal(false)}
                      className="px-4 py-2 border border-[#cbd5e1] text-[#475569] font-semibold rounded-lg hover:bg-[#f1f5f9]"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (resetEmail.trim()) {
                          setResetSuccess(true);
                        }
                      }}
                      className="px-4 py-2 bg-[#0058be] text-white font-bold rounded-lg hover:bg-[#2170e4] flex items-center gap-1.5"
                    >
                      <Mail className="w-4 h-4" />
                      Gửi Yêu Cầu
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clean Light Footer */}
      <footer className="px-6 py-3 border-t border-[#e2e8f0] bg-white text-xs text-[#64748b] flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00855b]" />
          <span>Hệ Thống Trực Tuyến • Máy Chủ Data Hall Alpha</span>
        </div>
        <div>
          © 2026 AR-IMMS Enterprise • Giám Sát & Vận Hành Hạ Tầng
        </div>
      </footer>

    </div>
  );
};
