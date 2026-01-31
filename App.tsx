
import React, { useState, useEffect } from 'react';
import { analyzePassword } from './utils/calculations';
import { getSecurityExplanation } from './services/geminiService';
import { PasswordAnalysis, StrengthLevel, SecurityTips } from './types';

const StrengthBadge: React.FC<{ strength: StrengthLevel }> = ({ strength }) => {
  const colors: Record<StrengthLevel, string> = {
    [StrengthLevel.VERY_WEAK]: 'bg-red-100 text-red-700 border-red-200',
    [StrengthLevel.WEAK]: 'bg-orange-100 text-orange-700 border-orange-200',
    [StrengthLevel.MEDIUM]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [StrengthLevel.STRONG]: 'bg-green-100 text-green-700 border-green-200',
    [StrengthLevel.VERY_STRONG]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-colors duration-500 ${colors[strength]}`}>
      {strength}
    </span>
  );
};

const MetricItem: React.FC<{ label: string; active: boolean; icon: string }> = ({ label, active, icon }) => (
  <div className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 ${active ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 text-gray-400 border-gray-100'} border`}>
    <span className="text-xl">{icon}</span>
    <span className="text-sm font-semibold">{label}</span>
    {active && (
      <svg className="w-5 h-5 mr-auto text-indigo-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    )}
  </div>
);

const App: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [tips, setTips] = useState<SecurityTips | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  useEffect(() => {
    const result = analyzePassword(password);
    setAnalysis(password.length > 0 ? result : null);
    
    if (password.length > 3) {
      const timer = setTimeout(async () => {
        setLoadingTips(true);
        const aiResponse = await getSecurityExplanation(password, result.strength);
        setTips(aiResponse);
        setLoadingTips(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setTips(null);
    }
  }, [password]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white pt-12 pb-24 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">מעבדת הסייבר: עוצמת סיסמאות</h1>
        <p className="text-indigo-100 text-xl max-w-2xl mx-auto font-light">
          בואו נבדוק כמה זמן ייקח להאקרים לפרוץ את המבצר הדיגיטלי שלכם.
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 rounded-[2rem] shadow-2xl border border-white/20 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-6">
                <label className="text-xl font-bold text-slate-700">הזינו סיסמה לבדיקה:</label>
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1 transition-colors"
                >
                  {showPassword ? 'הסתר 🙈' : 'הצג 👁️'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="למשל: MyS3cureP@ss!"
                  className="w-full text-2xl p-6 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none bg-slate-50/50 font-mono tracking-widest text-center"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  {password.length > 0 && <span>{password.length} תווים</span>}
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <MetricItem label="אותיות קטנות" active={analysis?.hasLowercase || false} icon="abc" />
                <MetricItem label="אותיות גדולות" active={analysis?.hasUppercase || false} icon="ABC" />
                <MetricItem label="מספרים" active={analysis?.hasNumbers || false} icon="123" />
                <MetricItem label="סימנים" active={analysis?.hasSymbols || false} icon="#?!" />
                <MetricItem label="עברית" active={analysis?.hasHebrew || false} icon="אבג" />
                <MetricItem label="אורך (12+)" active={(analysis?.length || 0) >= 12} icon="📏" />
              </div>
            </section>

            {analysis && (
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                  <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                    <span className="text-4xl">💻</span>
                  </div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-2">מחשב אישי סטנדרטי</h3>
                  <p className="text-3xl font-black text-slate-800 leading-tight">{analysis.timePC}</p>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">מחשב בודד המבצע כמיליארד ניסיונות בשנייה אחת</p>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform">
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-2">מערך שרתים (קלאסטר)</h3>
                  <p className="text-3xl font-black text-indigo-700 leading-tight">{analysis.timeCluster}</p>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">רשת של 200 מחשבי-על העובדים במקביל</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <section className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="text-2xl">🛡️</span>
                דירוג אבטחה
              </h3>
              {analysis ? (
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                    <span className="text-sm text-indigo-200">סטטוס נוכחי:</span>
                    <StrengthBadge strength={analysis.strength} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-indigo-300">
                      <span>אנטרופיה (מורכבות)</span>
                      <span>{Math.round(analysis.entropy)} bits</span>
                    </div>
                    <div className="w-full bg-indigo-950 h-4 rounded-full p-1 border border-indigo-800">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                        style={{ 
                          width: `${Math.min((analysis.entropy / 100) * 100, 100)}%`,
                          backgroundColor: analysis.strength === StrengthLevel.VERY_STRONG ? '#10b981' : 
                                          analysis.strength === StrengthLevel.STRONG ? '#34d399' :
                                          analysis.strength === StrengthLevel.MEDIUM ? '#fbbf24' : '#ef4444'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-indigo-300/60 py-4 text-center border-2 border-dashed border-indigo-700/50 rounded-xl">
                  הזינו סיסמה כדי להתחיל
                </div>
              )}
            </section>

            <section className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-indigo-600">
                <span className="p-2 bg-indigo-50 rounded-lg">💡</span>
                טיפים מהמומחה
              </h3>
              {loadingTips ? (
                <div className="space-y-4">
                  <div className="h-4 bg-slate-100 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse"></div>
                </div>
              ) : tips ? (
                <div className="space-y-6 text-base leading-relaxed text-slate-600">
                  <div className="bg-slate-50 p-5 rounded-2xl border-r-4 border-indigo-500 italic relative">
                    <span className="absolute -top-3 -right-2 text-3xl opacity-10">"</span>
                    {tips.context}
                  </div>
                  <div className="font-bold text-slate-800 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">✨</span>
                    <span>{tips.advice}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center italic py-4">הזינו לפחות 4 תווים לקבלת טיפים מותאמים אישית...</p>
              )}
            </section>
          </div>

        </div>

        {/* Info Section */}
        <section className="mt-16 bg-white p-10 rounded-[3rem] shadow-lg border border-slate-100">
          <h2 className="text-3xl font-bold mb-10 text-center text-slate-800">מדריך הסייבר המהיר</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="relative pl-6">
              <div className="text-5xl font-black text-indigo-50 absolute -top-4 -right-4 select-none pointer-events-none">01</div>
              <h4 className="font-bold text-indigo-600 text-lg mb-3">למה סיסמה ארוכה טובה יותר?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">כל תו שאתם מוסיפים לסיסמה מגדיל את מספר האפשרויות בצורה מעריכית. סיסמה של 12 תווים חזקה פי מיליונים מסיסמה של 8 תווים!</p>
            </div>
            <div className="relative pl-6">
              <div className="text-5xl font-black text-indigo-50 absolute -top-4 -right-4 select-none pointer-events-none">02</div>
              <h4 className="font-bold text-indigo-600 text-lg mb-3">מה זה Brute Force?</h4>
              <p className="text-sm text-slate-500 leading-relaxed">זו שיטה שבה המחשב פשוט מנחש את כל השילובים האפשריים. ככל שהמחשב חזק יותר, הוא מבצע יותר ניחושים בשנייה אחת.</p>
            </div>
            <div className="relative pl-6">
              <div className="text-5xl font-black text-indigo-50 absolute -top-4 -right-4 select-none pointer-events-none">03</div>
              <h4 className="font-bold text-indigo-600 text-lg mb-3">טיפ המקצוענים: Passphrase</h4>
              <p className="text-sm text-slate-500 leading-relaxed">במקום סיסמה מסובכת שקשה לזכור, נסו משפט של 4-5 מילים אקראיות. זה יוצר סיסמה ארוכה מאוד שקלה לזיכרון ובלתי אפשרית לפריצה.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-24 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} מעבדת הסייבר החינוכית - למטרות לימודיות בלבד</p>
        <p className="mt-2 text-xs opacity-50">אין להזין סיסמאות אמיתיות שבהן אתם משתמשים באתרים אחרים.</p>
      </footer>
    </div>
  );
};

export default App;
