
import React, { useState, useCallback, useEffect } from 'react';
import { ProductInput, AnalysisResult, AppState } from './types';
import { GeminiService } from './services/geminiService';
import { Button } from './components/ui/Button';

const App: React.FC = () => {
  const [product, setProduct] = useState<ProductInput>({
    name: '',
    description: '',
    targetAudience: '',
    keyBenefits: ['']
  });
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        setShowKeyDialog(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio?.openSelectKey();
    setShowKeyDialog(false);
  };

  const addBenefit = () => {
    setProduct(prev => ({ ...prev, keyBenefits: [...prev.keyBenefits, ''] }));
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...product.keyBenefits];
    newBenefits[index] = value;
    setProduct(prev => ({ ...prev, keyBenefits: newBenefits }));
  };

  const handleAnalyze = async () => {
    if (!product.name || !product.description) {
      setError("Vui lòng điền tên và mô tả sản phẩm.");
      return;
    }

    try {
      setAppState(AppState.ANALYZING);
      setError(null);
      const data = await GeminiService.analyzeProduct(product);
      setResult(data);
      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setShowKeyDialog(true);
      }
      setError("Phân tích thất bại. Vui lòng kiểm tra lại thông tin hoặc API Key.");
      setAppState(AppState.ERROR);
    }
  };

  const handleGenerateVideo = async () => {
    if (!result) return;
    try {
      setAppState(AppState.GENERATING_VIDEO);
      const url = await GeminiService.generateVideo(result.strategy.videoPrompt);
      setVideoUrl(url);
      setAppState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError("Tạo video thất bại. Đảm bảo API Key của bạn có quyền truy cập mô hình Veo.");
      setAppState(AppState.COMPLETED);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-effect border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center font-bold text-xl">A</div>
            <h1 className="text-xl font-bold tracking-tight">AdGenius</h1>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" onClick={() => window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank')} className="text-xs">Thông tin Thanh toán</Button>
             <Button variant="secondary" onClick={handleOpenKeySelector} className="text-xs">Đổi API Key</Button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            Từ <span className="gradient-text">Insight</span> Sâu Sắc Đến Nội Dung <span className="gradient-text">Viral</span>
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Phân tích "Job to be Done", khai thác tâm lý khách hàng và tạo video quảng cáo đỉnh cao chỉ trong vài giây.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Section */}
          <section className="space-y-8">
            <div className="glass-effect rounded-3xl p-8 space-y-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-blue-500">01.</span> Thông tin Sản phẩm
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Tên sản phẩm</label>
                  <input 
                    type="text" 
                    value={product.name}
                    onChange={e => setProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="VD: Đèn học thông minh Luminify"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Mô tả sản phẩm</label>
                  <textarea 
                    rows={4}
                    value={product.description}
                    onChange={e => setProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Mô tả sản phẩm của bạn và cách nó hoạt động..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Đối tượng mục tiêu</label>
                  <input 
                    type="text" 
                    value={product.targetAudience}
                    onChange={e => setProduct(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="VD: Nhân viên văn phòng, học sinh sinh viên..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Lợi ích chính</label>
                  <div className="space-y-2">
                    {product.keyBenefits.map((benefit, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        value={benefit}
                        onChange={e => updateBenefit(idx, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="VD: Giảm mỏi mắt khi làm việc đêm"
                      />
                    ))}
                  </div>
                  <button 
                    onClick={addBenefit}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    + Thêm lợi ích khác
                  </button>
                </div>
              </div>

              <Button 
                className="w-full py-4 text-lg" 
                onClick={handleAnalyze}
                isLoading={appState === AppState.ANALYZING}
              >
                Bắt đầu Phân tích Chiến lược
              </Button>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            </div>
          </section>

          {/* Result Section */}
          <section className="space-y-8">
            {!result ? (
              <div className="h-full min-h-[500px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-500 p-12 text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <h4 className="text-xl font-semibold mb-2">Kết quả phân tích sẽ xuất hiện tại đây</h4>
                <p>Hoàn thành biểu mẫu bên trái để tạo insight và chiến lược nội dung.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* JTBD Analysis */}
                <div className="glass-effect rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-purple-500">02.</span> Khung giải pháp JTBD
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Chức năng (Functional)</span>
                        <p className="mt-1 text-slate-200">{result.jtbd.functionalJob}</p>
                      </div>
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Cảm xúc (Emotional)</span>
                        <p className="mt-1 text-slate-200">{result.jtbd.emotionalJob}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <span className="text-xs uppercase tracking-wider text-pink-400 font-bold">Xã hội (Social)</span>
                        <p className="mt-1 text-slate-200">{result.jtbd.socialJob}</p>
                      </div>
                      <div className="p-4 bg-indigo-900/20 rounded-2xl border border-indigo-500/30">
                        <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">Insight Cốt lõi</span>
                        <p className="mt-1 text-slate-100 italic">"{result.jtbd.mainInsight}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Strategy */}
                <div className="glass-effect rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="text-emerald-500">03.</span> Chiến lược Sáng tạo
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="bg-emerald-500/10 border-2 border-emerald-500/30 p-6 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase">Hook 3 giây đầu</span>
                         <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">QUAN TRỌNG</span>
                      </div>
                      <p className="text-xl font-bold leading-tight">{result.strategy.threeSecondHook}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Caption Quảng cáo</span>
                      <p className="mt-2 text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">{result.strategy.caption}</p>
                    </div>

                    <div>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Từ khóa Hình ảnh</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.strategy.visualKeywords.map((tag, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Gợi ý Prompt Video AI</span>
                      <div className="mt-2 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl relative group">
                        <p className="text-slate-200 text-sm line-clamp-3 group-hover:line-clamp-none transition-all duration-300">{result.strategy.videoPrompt}</p>
                        <Button 
                          variant="primary" 
                          className="mt-4 w-full"
                          onClick={handleGenerateVideo}
                          isLoading={appState === AppState.GENERATING_VIDEO}
                          disabled={!!videoUrl}
                        >
                          {videoUrl ? "Video Đã Được Tạo" : "Tạo Video bằng AI (Veo 3.1)"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Preview */}
                {videoUrl && (
                  <div className="glass-effect rounded-3xl p-4 animate-in zoom-in duration-500">
                     <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="w-full h-auto rounded-2xl shadow-2xl border border-slate-700 aspect-[9/16] bg-black"
                     />
                     <div className="mt-4 flex justify-between items-center px-2">
                        <span className="text-xs text-slate-400">Độ phân giải: 720p • Dọc (9:16)</span>
                        <a href={videoUrl} download="product-video.mp4" className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          Tải Video Xuống
                        </a>
                     </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Key Selection Dialog */}
      {showKeyDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          <div className="relative glass-effect p-8 rounded-[2rem] max-w-md w-full shadow-2xl border-2 border-blue-500/30">
            <h2 className="text-2xl font-bold mb-4">Chọn API Key</h2>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Để tạo video AI và phân tích sâu, bạn cần chọn một API Key từ Google AI Studio. 
              Hãy đảm bảo tài khoản của bạn đã bật thanh toán để sử dụng mô hình Veo.
            </p>
            <div className="space-y-3">
              <Button className="w-full py-4 text-lg" onClick={handleOpenKeySelector}>
                Chọn API Key
              </Button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="block text-center text-sm text-slate-500 hover:text-slate-300 underline"
              >
                Tìm hiểu về thanh toán và yêu cầu
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-20 py-10 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-sm">Vận hành bởi Gemini 3 Pro & Veo 3.1 Fast</p>
      </footer>
    </div>
  );
};

export default App;
