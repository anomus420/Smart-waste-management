import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const features = [
  { icon: '📋', title: 'File Complaints', desc: 'Report waste issues with photos and location. Track resolution in real-time.', link: '/file-complaint', cta: 'Report Issue' },
  { icon: '♻️', title: 'E-Waste Pickup', desc: 'Schedule doorstep collection for electronics. Responsible recycling made easy.', link: '/ewaste', cta: 'Schedule Pickup' },
  { icon: '🗺️', title: 'Collection Map', desc: 'Find certified e-waste centers near you on an interactive map.', link: '/map', cta: 'View Map' },
  { icon: '📚', title: 'Awareness Hub', desc: 'Learn best practices for waste management and sustainability.', link: '/awareness', cta: 'Start Learning' },
]

const scannerItems = [
  { 
    name: 'Plastic Water Bottle', 
    icon: '🥤', 
    type: 'Recyclable Plastic (PET 1)', 
    purity: '98%', 
    co2: '0.45 kg', 
    points: 15,
    tip: 'Rinse before deposit. Ensure cap is removed and recycled separately.',
    color: 'from-blue-500/20 to-teal-500/20'
  },
  { 
    name: 'Broken Smartphone', 
    icon: '📱', 
    type: 'Electronic Waste (E-Waste)', 
    purity: '91%', 
    co2: '8.20 kg', 
    points: 120,
    tip: 'Contains valuable lithium and copper. Do not dispose in regular trash. Certified center required.',
    color: 'from-amber-500/20 to-red-500/20'
  },
  { 
    name: 'Vegetable Scraps', 
    icon: '🥬', 
    type: 'Organic Waste (Compostable)', 
    purity: '100%', 
    co2: '0.12 kg', 
    points: 5,
    tip: 'Perfect for composting. Diverts methane emissions from local landfills.',
    color: 'from-green-500/20 to-emerald-500/20'
  },
  { 
    name: 'Soda Aluminum Can', 
    icon: '🥫', 
    type: 'Recyclable Metal (Alu)', 
    purity: '96%', 
    co2: '1.60 kg', 
    points: 30,
    tip: 'Aluminum can be recycled infinitely with zero degradation. Crush to save space.',
    color: 'from-indigo-500/20 to-purple-500/20'
  }
]

const Home = () => {
  const { isAuthenticated } = useAuth()
  
  // Interactive Slider State
  const [sliderPos, setSliderPos] = useState(50)
  
  // AI Scanner Simulation State
  const [selectedScanIndex, setSelectedScanIndex] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState(null)
  
  // Pillars Modal State
  const [activeFeature, setActiveFeature] = useState(null)
  
  // Carbon Calculator State
  const [plasticKg, setPlasticKg] = useState(5)
  const [paperKg, setPaperKg] = useState(8)
  const [eWasteUnits, setEWasteUnits] = useState(1)
  
  // Notifications
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Handle AI Scanner click
  const triggerScan = () => {
    setScanning(true)
    setScanResult(null)
    setScanProgress(0)
  }

  // Scan progress simulator
  useEffect(() => {
    let interval
    if (scanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setScanning(false)
            setScanResult(scannerItems[selectedScanIndex])
            return 100
          }
          return prev + 10
        })
      }, 150)
    }
    return () => clearInterval(interval)
  }, [scanning, selectedScanIndex])

  // Carbon Offsets live calculations
  const computedCO2 = (plasticKg * 1.5 + paperKg * 0.9 + eWasteUnits * 8.5).toFixed(1)
  const computedWater = (plasticKg * 24 + paperKg * 28).toFixed(0)
  const computedPoints = (plasticKg * 10 + paperKg * 5 + eWasteUnits * 120).toFixed(0)

  // Handle simulate logging eco-points
  const handleLogPoints = () => {
    setToastMessage(`Success! +${computedPoints} EcoPoints registered under SmartWaste profile.`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4500)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-850 dark:bg-[#030712] dark:text-slate-100 font-sans relative overflow-hidden transition-colors duration-305">
      
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="bg-white dark:bg-[#0f172a] border border-green-500 dark:border-[#00ff9d] text-green-700 dark:text-[#00ff9d] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
            <span className="text-xl">✨</span>
            <p className="font-semibold text-sm">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Grid line background overlay */}
      <div className="absolute inset-0 cyber-grid pointer-events-none opacity-40 dark:opacity-30" />
      
      {/* Atmospheric green & cyan blur lights */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-green-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-cyan-500/5 dark:bg-cyan-500/10 blur-[120px] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-20 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-left">
            <div className="inline-flex items-center gap-2 bg-green-500/10 dark:bg-[#00ff9d]/5 border border-green-500/20 dark:border-[#00ff9d]/20 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider text-green-700 dark:text-[#00ff9d] mb-6 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600 dark:bg-[#00ff9d] animate-pulse" />
              Building Cleaner Cities
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold font-display leading-tight tracking-tight text-slate-900 dark:text-white mb-6">
              Smart Waste<br />
              <span className="bg-gradient-to-r from-green-600 to-cyan-600 dark:from-[#00ff9d] dark:to-[#06b6d4] bg-clip-text text-transparent">
                Management
              </span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-10 leading-relaxed">
              Report waste issues, schedule e-waste pickups, and contribute to a cleaner, greener community.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/file-complaint" className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-sm hover:shadow-xl hover:shadow-green-600/25 dark:hover:shadow-[#00ff9d]/25 hover:scale-[1.03] transition-all">
                File a Complaint
              </Link>
              <Link to="/ewaste" className="px-8 py-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-350 dark:hover:border-slate-750 hover:scale-[1.03] transition-all">
                Request E-Waste Pickup
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative flex justify-center">
            {/* Geometric layout visualization */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 backdrop-blur-md p-4 pulse-ring shadow-2xl dark:shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-green-500/5 dark:from-[#00ff9d]/5 to-transparent pointer-events-none" />
              
              {/* Centered Guidelines SVG */}
              <svg className="absolute inset-0 m-auto w-[85%] h-[85%] text-slate-500 dark:text-slate-750 opacity-50" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
                <circle cx="50" cy="50" r="25" />
                <circle cx="50" cy="50" r="10" stroke="currentColor" strokeWidth="0.5" />
                <path d="M50 0 V100 M0 50 H100 M15 15 L85 85 M85 15 L15 85" strokeWidth="0.5" />
              </svg>

              {/* Centered Green Orb */}
              <div className="absolute inset-0 m-auto w-36 h-36 rounded-full bg-gradient-to-tr from-green-500/10 to-cyan-500/10 dark:from-[#00ff9d]/20 dark:to-[#06b6d4]/20 border border-green-300 dark:border-[#00ff9d]/30 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)] dark:shadow-[0_0_50px_rgba(0,255,157,0.15)] z-10 hover:scale-105 transition-transform duration-500">
                {/* Properly sized recycle SVG icon */}
                <svg className="w-12 h-12 text-green-600 dark:text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <div className="absolute inset-1 rounded-full border border-dashed border-green-500/30 dark:border-[#06b6d4]/40 animate-spin" style={{ animationDuration: '25s' }} />
              </div>

              {/* Orbiting sensors */}
              <div className="absolute top-12 left-12 w-3 h-3 rounded-full bg-green-500 dark:bg-[#00ff9d] animate-ping" />
              <div className="absolute bottom-12 right-12 w-3.5 h-3.5 rounded-full bg-cyan-500 dark:bg-[#06b6d4] shadow-md dark:shadow-[0_0_10px_#06b6d4] animate-pulse" />
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 z-10 border-t border-slate-300 dark:border-white/11">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            ['10,000+', 'Complaints Resolved'],
            ['500+', 'E-Waste Centers'],
            ['50,000+', 'Eco Points Earned'],
            ['99%', 'Satisfaction Rate']
          ].map(([value, label], idx) => (
            <div key={idx} className="group">
              <p className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-[#00ff9d] transition-colors">{value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider mt-2 uppercase">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. INTERACTIVE TOOLS / IMPACT CORNER */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 z-10 border-t border-slate-200 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 text-left">
            <span className="text-xs text-green-600 dark:text-[#00ff9d] font-mono tracking-widest uppercase">Smart City Tools</span>
            <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-1 mb-6">
              Empowering Community <br />Action with AI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              SmartWaste integrates real-time interactive dashboards and telemetry systems directly in your neighborhood. Simulate a sorting scan on common household waste using our machine classification utility.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-[#00ff9d]/10 flex items-center justify-center text-xl shrink-0 text-green-650 dark:text-[#00ff9d] border border-green-500/20 dark:border-[#00ff9d]/20">
                  🔬
                </div>
                <div>
                  <h4 className="font-bold text-slate-805 dark:text-white text-base">Instant Smart Categorization</h4>
                  <p className="text-slate-550 dark:text-slate-450 text-sm mt-1">Simulate waste evaluation to review carbon savings and project points accumulation.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-[#06b6d4]/10 flex items-center justify-center text-xl shrink-0 text-cyan-600 dark:text-[#06b6d4] border border-cyan-500/20 dark:border-[#06b6d4]/20">
                  🌱
                </div>
                <div>
                  <h4 className="font-bold text-slate-805 dark:text-white text-base">Carbon Mitigation Metric</h4>
                  <p className="text-slate-550 dark:text-slate-450 text-sm mt-1">Diverting plastics, cardboard, and electronics directly offsets greenhouse gas footprints.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-4 font-display">
                  <span className="w-2 h-2 rounded-full bg-green-550 dark:bg-[#00ff9d] animate-ping" />
                  AI Waste Scan Simulator
                </h3>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full uppercase">
                  SIMULATION ACTIVE
                </span>
              </div>

              {/* Selector List */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {scannerItems.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setSelectedScanIndex(idx); setScanResult(null); }}
                    className={`py-3 px-2 rounded-xl border text-center transition-all ${
                      selectedScanIndex === idx 
                        ? 'bg-green-500/10 dark:bg-[#00ff9d]/10 border-green-500 dark:border-[#00ff9d] text-green-700 dark:text-white font-bold shadow-sm' 
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{item.icon}</span>
                    <span className="text-[10px] font-bold uppercase truncate block">{item.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Scan Console Frame */}
              <div className="scan-container aspect-video rounded-2xl bg-slate-950 border border-slate-850 dark:border-white/10 flex flex-col items-center justify-center p-6 relative">
                {scanning && <div className="scan-laser" />}
                
                {!scanning && !scanResult && (
                  <div className="text-center">
                    <span className="text-5xl block mb-4 animate-pulse">
                      {scannerItems[selectedScanIndex].icon}
                    </span>
                    <p className="text-sm font-semibold text-slate-300">Ready to Analyze</p>
                    <p className="text-xs text-[#00ff9d] mt-1 uppercase font-mono">{scannerItems[selectedScanIndex].name}</p>
                    <button 
                      onClick={triggerScan}
                      className="mt-6 px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-550 to-cyan-550 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-xs hover:shadow-lg transition-all"
                    >
                      Run Classification
                    </button>
                  </div>
                )}

                {scanning && (
                  <div className="text-center z-10">
                    <span className="text-5xl block mb-4 animate-spin" style={{ animationDuration: '4s' }}>
                      {scannerItems[selectedScanIndex].icon}
                    </span>
                    <p className="text-sm text-slate-300 font-mono">Analyzing atomic mass...</p>
                    <div className="w-48 bg-white/5 border border-white/10 h-2.5 rounded-full mx-auto mt-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00ff9d] to-[#06b6d4] transition-all duration-150" style={{ width: `${scanProgress}%` }} />
                    </div>
                    <span className="text-xs text-[#00ff9d] font-mono mt-2 block">{scanProgress}%</span>
                  </div>
                )}

                {scanResult && !scanning && (
                  <div className="w-full h-full text-left flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-[#00ff9d] font-mono uppercase tracking-wider">Classification Success</span>
                        <h4 className="text-lg font-bold text-white mt-0.5">{scanResult.name}</h4>
                      </div>
                      <span className="text-3xl">{scanResult.icon}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 my-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Material Grade</span>
                        <span className="text-xs font-semibold text-slate-200">{scanResult.type}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">Composition Purity</span>
                        <span className="text-xs font-semibold text-slate-200">{scanResult.purity}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">EcoPoints Reward</span>
                        <span className="text-xs font-semibold text-[#00ff9d]">{scanResult.points} Points</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono block uppercase">CO2 Savings</span>
                        <span className="text-xs font-semibold text-[#06b6d4]">{scanResult.co2} Offset</span>
                      </div>
                    </div>

                    <div className="text-[11px] bg-[#00ff9d]/5 border border-[#00ff9d]/10 p-3 rounded-lg text-slate-300">
                      <span className="font-bold text-[#00ff9d]">Routing Directive: </span>
                      {scanResult.tip}
                    </div>

                    <div className="flex gap-2 mt-4 justify-end">
                      <button 
                        onClick={() => setScanResult(null)}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-slate-300"
                      >
                        Reset Console
                      </button>
                      <button 
                        onClick={handleLogPoints}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-550 to-cyan-550 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 text-xs font-bold hover:shadow-lg transition-all"
                      >
                        Register Points
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FEATURES SECTION (Everything You Need) */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-white/5 z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 dark:text-white mb-4">Everything You Need</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">A comprehensive platform for modern, tech-driven waste management.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div key={feat.title} className="bg-white dark:bg-slate-900/60 rounded-2xl p-6 border border-slate-200 dark:border-white/5 hover:border-green-400 dark:hover:border-[#00ff9d]/30 shadow-md hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(0,255,157,0.08)] transition-all group flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 font-display">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">{feat.desc}</p>
              </div>
              <button 
                onClick={() => setActiveFeature(feat)}
                className="text-sm font-semibold text-green-600 dark:text-[#00ff9d] hover:text-green-755 dark:hover:text-[#06b6d4] flex items-center gap-1 group-hover:gap-2 transition-all self-start mt-4"
              >
                {feat.cta} <span>→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE DETAILS MODAL */}
      {activeFeature && (
        <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] w-full max-w-md rounded-3xl border border-slate-200 dark:border-[#00ff9d]/30 shadow-2xl p-8 relative">
            <button 
              onClick={() => setActiveFeature(null)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            >
              ✕
            </button>
            <div className="text-4xl mb-4">{activeFeature.icon}</div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-display mb-4">{activeFeature.title}</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              {activeFeature.desc} Our SmartWaste integration ensures that actions completed under this module directly contribute to community cleanliness metrics and your personal EcoPoints ledger.
            </p>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setActiveFeature(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-600 dark:bg-white/5 dark:border-white/10 dark:text-slate-350 dark:hover:bg-white/10 text-xs font-semibold"
              >
                Cancel
              </button>
              <Link 
                to={activeFeature.link}
                onClick={() => setActiveFeature(null)}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-550 to-cyan-550 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 text-xs font-bold text-center flex items-center"
              >
                Launch Feature
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE BEFORE/AFTER SLIDER (The Clean City Metric) */}
      <section className="relative max-w-7xl mx-auto px-6 py-20 border-t border-slate-200 dark:border-white/5 z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold font-display text-slate-900 dark:text-white mb-4">The Clean City Metric</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Witness the transformation as our Luminous Intelligence integrates into municipal grids worldwide.</p>
        </div>

        {/* Drag Comparison Slider */}
        <div className="relative aspect-video max-w-4xl mx-auto rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 select-none shadow-2xl">
          
          {/* BASE: Traditional Grid (Before state) */}
          <div className="absolute inset-0 bg-slate-900 dark:bg-[#080d16] flex flex-col items-center justify-center p-8 text-center">
            {/* PLACEHOLDER: Replace src with your "before" image */}
            <img
              src="/assets/images/before-tarditional-waste.png"
              alt="Traditional manual waste collection"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 pointer-events-none" />

            <div className="absolute bottom-6 left-6 z-10 text-left bg-black/60 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-red-500/20">
              <span className="text-[10px] text-red-400 font-bold tracking-widest block uppercase">Traditional Infrastructure</span>
              <span className="text-sm font-semibold text-white">Manual waste collection, higher carbon output</span>
            </div>
          </div>

          {/* OVERLAY: SmartWaste Grid (After state) */}
          <div 
            className="absolute inset-0 bg-emerald-950/40 dark:bg-[#022c22]/40 flex flex-col items-center justify-center p-8 text-center transition-all overflow-hidden border-r border-green-500/30 dark:border-[#00ff9d]/30"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute top-0 left-0 w-[896px] h-full flex flex-col items-center justify-center p-8 pointer-events-none">
              {/* PLACEHOLDER: Replace src with your "after" image */}
              <img
                src="/assets/images/after-smartwaste.png"
                alt="SmartWaste sensor-driven ecosystem"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 z-10 text-left bg-[#030712]/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-[#00ff9d]/30">
                <span className="text-[10px] text-[#00ff9d] font-bold tracking-widest block uppercase">SmartWaste Ecosystem</span>
                <span className="text-sm font-semibold text-white">Sensor-driven logistics, optimal sorting</span>
              </div>
            </div>
          </div>

          {/* Invisible slider input */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30 compare-slider"
          />

          {/* Sliding bar */}
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-green-500 dark:bg-[#00ff9d] pointer-events-none z-20"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-950 border-2 border-green-600 dark:border-[#00ff9d] flex items-center justify-center text-green-600 dark:text-[#00ff9d] shadow-lg">
              ↔
            </div>
          </div>

        </div>
        <p className="text-center text-xs text-slate-500 mt-4">Drag the divider bar to compare layout grids.</p>
      </section>
      {/* 6. CARBON CALCULATOR */}
      <section className="relative max-w-4xl mx-auto px-6 py-16 z-10">
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#06b6d4]/5 to-transparent pointer-events-none" />
          
          <div className="text-center mb-10">
            <span className="text-xs text-[#06b6d4] font-mono tracking-widest uppercase">Live Carbon Estimator</span>
            <h3 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">Compute Your Contribution</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Adjust waste volumes to estimate carbon mitigation and project EcoPoints.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Range Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-300">Plastic Diverted</span>
                  <span className="text-green-700 dark:text-[#00ff9d] font-mono">{plasticKg} kg/week</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="20" 
                  value={plasticKg}
                  onChange={(e) => setPlasticKg(Number(e.target.value))}
                  className="w-full accent-green-600 dark:accent-[#00ff9d] bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-300">Paper Diverted</span>
                  <span className="text-green-700 dark:text-[#00ff9d] font-mono">{paperKg} kg/week</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={paperKg}
                  onChange={(e) => setPaperKg(Number(e.target.value))}
                  className="w-full accent-green-600 dark:accent-[#00ff9d] bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold mb-2">
                  <span className="text-slate-600 dark:text-slate-300">E-Waste Items Sorted</span>
                  <span className="text-green-700 dark:text-[#00ff9d] font-mono">{eWasteUnits} items/year</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={eWasteUnits}
                  onChange={(e) => setEWasteUnits(Number(e.target.value))}
                  className="w-full accent-green-600 dark:accent-[#00ff9d] bg-slate-200 dark:bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Calculations Dashboard */}
            <div className="bg-slate-55 dark:bg-slate-950/70 border border-slate-200 dark:border-white/5 rounded-2xl p-6 text-left flex flex-col justify-between h-full min-h-[220px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">CO2 Saved Monthly</span>
                  <span className="text-xl font-extrabold text-slate-850 dark:text-white font-mono bg-white dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">{computedCO2} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Water Conserved</span>
                  <span className="text-lg font-extrabold text-cyan-600 dark:text-[#06b6d4] font-mono bg-white dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">{computedWater} Liters</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">EcoPoints Projected</span>
                  <span className="text-lg font-extrabold text-green-650 dark:text-[#00ff9d] font-mono bg-white dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">+{computedPoints} pts</span>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 dark:border-white/5 pt-4">
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogPoints}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-550 to-cyan-550 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-sm hover:shadow-xl hover:shadow-green-550/20 dark:hover:shadow-[#00ff9d]/25 transition-all text-center"
                  >
                    Log Impact to Profile
                  </button>
                ) : (
                  <Link 
                    to="/signup"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-sm hover:shadow-xl hover:shadow-green-600/25 dark:hover:shadow-[#00ff9d]/25 transition-all text-center block"
                  >
                    Signup to Track Impact
                  </Link>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. QUOTE SECTION */}
      <section className="relative max-w-4xl mx-auto px-6 py-12 text-center z-10">
        <span className="text-6xl text-green-500/10 dark:text-[#00ff9d]/20 font-display block h-6 select-none">“</span>
        <blockquote className="text-lg md:text-2xl italic font-display text-slate-805 dark:text-white max-w-3xl mx-auto leading-relaxed mt-4">
          The shift wasn't just in how we handle waste, but in how our city breathes. SmartWaste's data transparency allowed us to reclaim 20% of our municipal budget within the first year.
        </blockquote>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-[#06b6d4] dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-extrabold flex items-center justify-center text-xs">
            CV
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Dr. Clara Vance</p>
            <p className="text-xs text-slate-500">Chief of Urban Development, New Dublin</p>
          </div>
        </div>
      </section>

      {/* 8. ORIGINAL JOIN OUR COMMUNITY CTA */}
      {!isAuthenticated && (
        <section className="relative max-w-4xl mx-auto px-6 py-20 z-10">
          <div className="bg-white dark:bg-slate-900/60 rounded-3xl p-12 border border-slate-200 dark:border-[#00ff9d]/20 text-center relative overflow-hidden shadow-xl dark:shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 dark:from-[#00ff9d]/5 via-transparent to-[#06b6d4]/5 pointer-events-none" />
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Join Our Community</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">Create a free account and start making your city cleaner today.</p>
            <Link to="/signup" className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 dark:from-[#00ff9d] dark:to-[#06b6d4] text-white dark:text-gray-950 font-bold text-sm hover:shadow-lg hover:shadow-green-600/20 dark:hover:shadow-[#00ff9d]/20 hover:scale-[1.03] transition-all">
              Get Started Free
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}

export default Home