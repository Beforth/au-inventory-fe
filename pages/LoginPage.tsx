import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, User, AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../App';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showToast } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => setIsCheckingAuth(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (username === 'admin' && password === 'admin') {
        showToast('Welcome back, Admin!', 'success');
        navigate('/');
      } else {
        setError('Invalid username or password. Try admin/admin.');
      }
    }, 1200);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[60%] items-center justify-center bg-gradient-to-br from-blue-600/10 via-blue-50 to-purple-50 p-8">
        <div className="w-full h-full max-w-4xl flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/20">
              <span className="text-4xl font-bold text-white">A</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Aureole Inventory</h2>
              <p className="text-sm text-slate-500 mt-1">Enterprise Resource Planning</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mt-8">
              {['Sales', 'Inventory', 'Finance'].map((label) => (
                <div key={label} className="p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm">
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Aureole Inventory</h1>
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Welcome Back</h2>
            <p className="text-sm text-slate-600">Sign in to access the ERP dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                icon={<User size={16} />}
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                icon={<Lock size={16} />}
                disabled={isLoading}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={2} />
                    ) : (
                      <Eye size={16} strokeWidth={2} />
                    )}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              isLoading={isLoading}
              disabled={isLoading || !username || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <Shield size={14} />
              <span>Demo: admin / admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
