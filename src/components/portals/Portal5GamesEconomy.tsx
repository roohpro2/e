import React, { useState, useEffect } from 'react';
import { Gamepad2, Coins, Trophy, Sparkles, Gift, Zap, RefreshCw, Award, ArrowUpRight } from 'lucide-react';
import { firebaseService } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export const Portal5GamesEconomy: React.FC = () => {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(100);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isClaimingBonus, setIsClaimingBonus] = useState(false);

  useEffect(() => {
    loadUserBalanceAndScores();
  }, [user]);

  const loadUserBalanceAndScores = async () => {
    const balance = await firebaseService.getUserCoinBalance(user?.uid);
    setCoins(balance);
    const leaders = await firebaseService.getGameLeaderboards();
    setLeaderboards(leaders);
  };

  const handlePlayQuiz = async () => {
    if (coins < 10) {
      alert('رصيدك من العملات غير كافٍ (تحتاج 10 عملات على الأقل للعب)');
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    // Deduct entry fee
    await firebaseService.updateUserCoins(-10, user?.uid);

    setTimeout(async () => {
      // 70% win chance for interactive fun
      const win = Math.random() > 0.3;
      if (win) {
        const reward = 25;
        const newTotal = await firebaseService.updateUserCoins(reward, user?.uid);
        setCoins(newTotal);
        setGameResult(`🎉 تهانينا! خمنت البرومبت الصحيح وربحت ${reward} عملة Rooh Coin!`);
      } else {
        const currentBal = await firebaseService.getUserCoinBalance(user?.uid);
        setCoins(currentBal);
        setGameResult('حظ أوفر في الجولة القادمة! حاول مرة أخرى.');
      }
      setIsPlaying(false);
    }, 1500);
  };

  const handleClaimDailyBonus = async () => {
    setIsClaimingBonus(true);
    await new Promise((r) => setTimeout(r, 600));
    const newTotal = await firebaseService.updateUserCoins(50, user?.uid);
    setCoins(newTotal);
    setIsClaimingBonus(false);
    alert('🎁 تم إضافة 50 عملة مجانية إلى محفظتك بنجاح!');
  };

  return (
    <div id="portal-5-games-economy" className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              بوابة 5: ألعاب الذكاء الاصطناعي واقتصاد العملات (Games & Coin Economy)
            </h2>
            <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold font-mono">
              Portal 5
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            اربح عملات Rooh Coins عبر تخمين البرومبتات، وتنافس في لوحة المتصدرين المتزامنة سحابياً مع Realtime DB.
          </p>
        </div>

        {/* User Coin Balance Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 px-4 py-2 rounded-2xl shadow-lg">
          <Coins className="w-6 h-6 text-amber-400 animate-bounce" />
          <div>
            <div className="text-[10px] text-amber-300 font-bold">رصيد عملاتك</div>
            <div className="text-lg font-black text-white font-mono">{coins} <span className="text-xs text-amber-400">Rooh Coin</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Arena (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-amber-400" />
                <h3 className="text-base font-bold text-white">تحدي خمن البرومبت الذكي (AI Prompt Arena):</h3>
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                تكلفة الدخول: 10 عملات
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                هل يمكنك تخمين الكلمات المفتاحية والأسلوب الفني المستخدم لتوليد الصورة؟ اخبرنا بتوقعك واربح رصيد عملات إضافي لمضاعفة استخدام أدوات الذكاء الاصطناعي.
              </p>
              
              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                  alt="Game Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-bold text-amber-300 font-mono">ما هو الأسلوب: Photoreal أم Cyberpunk؟</span>
                </div>
              </div>
            </div>

            {gameResult && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold animate-in fade-in">
                {gameResult}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleClaimDailyBonus}
                disabled={isClaimingBonus}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>{isClaimingBonus ? 'جاري الاستلام...' : 'مكافأة يومية مجانية (+50)'}</span>
              </button>

              <button
                type="button"
                onClick={handlePlayQuiz}
                disabled={isPlaying}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>جاري التحقق والمطابقة...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>بدء التحدي وتخمين البرومبت (-10)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Leaderboards (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-bold text-white">لوحة الشرف والمتصدرين:</h3>
            </div>

            <div className="space-y-2.5">
              {leaderboards.map((leader) => (
                <div
                  key={leader.rank}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{leader.avatar}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{leader.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">النقاط: {leader.score}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-amber-400 font-mono">+{leader.coins}</div>
                    <div className="text-[9px] text-slate-500">عملة</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
