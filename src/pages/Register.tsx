import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, RefreshCw, Check, X, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function Register() {
  const navigate = useNavigate();
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [captchaChallenge, setCaptchaChallenge] = useState({ q: '', a: 0 });

  // Validation State
  const [emailValid, setEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    validateEmail(email);
  }, [email]);

  useEffect(() => {
    checkPasswordStrength(password);
    setPasswordsMatch(password === confirmPassword && password !== '');
  }, [password, confirmPassword]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaChallenge({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setCaptchaAnswer('');
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(re.test(email));
  };

  const checkPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    setPasswordStrength(score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid || passwordStrength < 2 || !passwordsMatch || !agreeTerms) {
      setMessage({ text: 'Mohon lengkapi formulir dengan benar.', type: 'error' });
      return;
    }

    if (parseInt(captchaAnswer) !== captchaChallenge.a) {
      setMessage({ text: 'Jawaban captcha salah.', type: 'error' });
      generateCaptcha();
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      setMessage({ 
        text: 'Registrasi berhasil! Silakan cek email Anda untuk verifikasi sebelum login.', 
        type: 'success' 
      });
      
      // Clear form
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreeTerms(false);
      generateCaptcha();

    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <div>
          <div className="flex justify-center">
             <Link to="/login" className="flex items-center text-sm text-slate-500 hover:text-primary mb-4">
               <ArrowLeft className="h-4 w-4 mr-1" /> Kembali ke Login
             </Link>
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bergabunglah dengan TaxPlanner hari ini
          </p>
        </div>

        {message && (
          <div className={`p-4 rounded-md flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.type === 'success' ? <Check className="h-5 w-5 mr-2 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    email && !emailValid 
                      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {email && (
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     {emailValid ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                   </div>
                )}
              </div>
              {email && !emailValid && <p className="mt-1 text-xs text-red-600">Format email tidak valid</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                   <div className="flex space-x-1 h-1.5">
                     {[1, 2, 3, 4].map((level) => (
                       <div 
                         key={level} 
                         className={`flex-1 rounded-full ${passwordStrength >= level 
                           ? (passwordStrength <= 2 ? 'bg-yellow-400' : 'bg-green-500') 
                           : 'bg-gray-200'}`}
                       />
                     ))}
                   </div>
                   <p className="mt-1 text-xs text-gray-500">
                     {passwordStrength < 2 ? 'Lemah (Gunakan huruf besar, angka, & simbol)' : passwordStrength < 4 ? 'Sedang' : 'Kuat'}
                   </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                      : 'border-gray-300 focus:ring-primary focus:border-primary'
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && (
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                     {passwordsMatch ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
                   </div>
                )}
              </div>
              {confirmPassword && !passwordsMatch && <p className="mt-1 text-xs text-red-600">Password tidak cocok</p>}
            </div>

            {/* Captcha */}
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Keamanan: Berapa hasil dari {captchaChallenge.q}?</label>
              <div className="flex gap-2">
                 <input
                  type="number"
                  required
                  className="block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="?"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={generateCaptcha}
                  className="p-2 text-slate-400 hover:text-slate-600"
                  title="Refresh Captcha"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                Saya menyetujui <a href="#" className="text-primary hover:text-blue-600">Syarat dan Ketentuan</a>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !emailValid || !passwordsMatch || !agreeTerms}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
              </span>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-blue-500">
                Masuk di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
