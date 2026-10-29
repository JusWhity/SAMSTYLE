import React, { useState, useEffect } from 'react';
import { X, Smartphone, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { toPersianDigits } from '../utils/payment';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { phone: string; fullName?: string }) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [testCodeNotice, setTestCodeNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setTestCodeNotice(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        setStep('otp');
        setCountdown(60);
        setSuccessNotice(data.message || 'کد تایید ارسال شد.');
        if (data.testCode) {
          setTestCodeNotice(data.testCode);
          setCode(data.testCode); // Auto-fill test code for convenience in test mode
        }
      } else {
        setErrorMessage(data.message || 'خطا در ارسال کد تایید.');
      }
    } catch {
      setErrorMessage('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, code, fullName }),
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        localStorage.setItem('samstyle_user', JSON.stringify(data.user));
        localStorage.setItem('samstyle_token', data.token);
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMessage(data.message || 'کد تایید نامعتبر است.');
      }
    } catch {
      setErrorMessage('خطای سرور در تایید کد.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep('phone');
    setCode('');
    setErrorMessage('');
    setSuccessNotice('');
    setTestCodeNotice(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xs shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-card)]">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
              ورود با شماره موبایل (پیامک OTP)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback messages */}
        {errorMessage && (
          <div className="m-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xs flex items-center gap-2 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="m-4 p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xs flex items-center gap-2 text-xs text-[var(--text-main)]">
            <CheckCircle2 size={15} className="shrink-0 text-[var(--accent)]" />
            <span>{successNotice}</span>
          </div>
        )}

        {testCodeNotice && (
          <div className="mx-4 mb-2 p-2.5 bg-yellow-950/40 border border-yellow-700/50 rounded-xs text-xs text-yellow-200 flex items-center justify-between">
            <span>کد تستی سامانه کاوه نگار:</span>
            <span className="font-mono font-bold tracking-widest text-sm bg-yellow-500/20 px-2 py-0.5 rounded">
              {testCodeNotice}
            </span>
          </div>
        )}

        {/* Step 1: Mobile Input */}
        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="p-4 sm:p-6 space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              جهت ورود یا ثبت‌نام در سام‌استایل، شماره تلفن همراه خود را وارد کنید تا کد تایید از طریق سامانه پیامکی کاوه نگار برای شما ارسال شود.
            </p>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                شماره موبایل *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-3 rounded-xs text-[var(--text-main)] text-sm outline-none text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !mobile.trim()}
              className="w-full py-3.5 bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-[#111111] text-xs sm:text-sm font-bold tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>در حال ارسال پیامک...</span>
                </>
              ) : (
                <>
                  <span>دریافت کد تایید یکبار مصرف</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>کد ارسال شده به {toPersianDigits(mobile)}:</span>
              <button
                type="button"
                onClick={handleReset}
                className="text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ArrowRight size={12} />
                <span>تغییر شماره</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-main)] mb-1.5">
                کد ۵ رقمی تایید *
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={5}
                  required
                  placeholder="۱۲۳۴۵"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-3 rounded-xs text-[var(--text-main)] text-center text-lg font-mono tracking-[0.5em] outline-none"
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">
                نام و نام خانوادگی (اختیاری)
              </label>
              <input
                type="text"
                placeholder="مثال: علی احمدی"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent)] p-2.5 rounded-xs text-[var(--text-main)] text-xs outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
              {countdown > 0 ? (
                <span>ارسال مجدد کد تا {toPersianDigits(countdown)} ثانیه دیگر</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[var(--accent)] hover:underline font-bold cursor-pointer"
                >
                  ارسال مجدد کد تایید
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.trim().length !== 5}
              className="w-full py-3.5 bg-[var(--accent)] hover:brightness-110 disabled:opacity-50 text-[#111111] text-xs sm:text-sm font-bold tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>در حال بررسی کد...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>تایید و ورود به سام‌استایل</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
