import { useState, useEffect, useRef, useCallback } from "react";

// ─── Wave definitions ────────────────────────────────────────────────────────
const WAVES = [
  { id:"gamma", name:"Gamma", hz:"30–100 Hz", beat:40, carrier:240, label:"Peak Cognition",  breathRate:10, color:"#1a0808", accent:"#ff5555", glow:"rgba(255,85,85,0.35)",   minBeat:30,  maxBeat:100 },
  { id:"beta",  name:"Beta",  hz:"13–30 Hz",  beat:20, carrier:220, label:"Active Focus",    breathRate:8,  color:"#1a1200", accent:"#f5c400", glow:"rgba(245,196,0,0.35)",   minBeat:13,  maxBeat:30  },
  { id:"alpha", name:"Alpha", hz:"8–13 Hz",   beat:10, carrier:210, label:"Flow State",      breathRate:6,  color:"#071a12", accent:"#10d98a", glow:"rgba(16,217,138,0.35)",  minBeat:8,   maxBeat:13  },
  { id:"theta", name:"Theta", hz:"4–8 Hz",    beat:6,  carrier:200, label:"Deep Meditation", breathRate:5,  color:"#1a0a30", accent:"#a855f7", glow:"rgba(168,85,247,0.35)",  minBeat:4,   maxBeat:8   },
  { id:"delta", name:"Delta", hz:"0.5–4 Hz",  beat:2,  carrier:180, label:"Deep Sleep",      breathRate:4,  color:"#0d0d2b", accent:"#4d4dff", glow:"rgba(77,77,255,0.35)",   minBeat:0.5, maxBeat:4   },
];

// ─── Journey definitions ─────────────────────────────────────────────────────
const JOURNEYS = [
  { id:"arc",        name:"The Arc",     duration:25*60, desc:"Beta → deep theta → alpha. Full descent and return.", accent:"#10d98a", glow:"rgba(16,217,138,0.35)",  points:[{t:0,freq:14},{t:4*60,freq:10},{t:9*60,freq:7},{t:16*60,freq:5},{t:21*60,freq:9},{t:25*60,freq:10}] },
  { id:"descent",    name:"Descent",     duration:25*60, desc:"Beta down to deep theta. For sleep or deep meditation.", accent:"#a855f7", glow:"rgba(168,85,247,0.35)", points:[{t:0,freq:16},{t:5*60,freq:12},{t:11*60,freq:8},{t:18*60,freq:5.5},{t:25*60,freq:4}] },
  { id:"focus",      name:"Focus Ramp",  duration:25*60, desc:"Theta → alpha → mid beta. For deep work mode.",      accent:"#f5c400", glow:"rgba(245,196,0,0.35)",   points:[{t:0,freq:6},{t:5*60,freq:7},{t:10*60,freq:10},{t:17*60,freq:14},{t:25*60,freq:18}] },
  { id:"restore",    name:"Restore",     duration:25*60, desc:"Alpha hold with a brief theta dip. Gentle recovery.", accent:"#4d4dff", glow:"rgba(77,77,255,0.35)",   points:[{t:0,freq:10},{t:6*60,freq:9},{t:12*60,freq:6},{t:18*60,freq:9},{t:25*60,freq:10}] },
  { id:"hyperfocus", name:"Hyperfocus",  duration:25*60, desc:"Alpha → high beta → gamma. Peak cognitive intensity.", accent:"#ff5555", glow:"rgba(255,85,85,0.35)",   points:[{t:0,freq:10},{t:4*60,freq:16},{t:9*60,freq:25},{t:14*60,freq:35},{t:20*60,freq:40},{t:25*60,freq:40}] },
  { id:"winddown",   name:"Wind Down",   duration:30*60, desc:"Alpha → theta → delta. Nightly descent into rest.",   accent:"#7b8cde", glow:"rgba(123,140,222,0.35)", points:[{t:0,freq:10},{t:5*60,freq:8},{t:11*60,freq:6},{t:17*60,freq:4.5},{t:23*60,freq:2.5},{t:30*60,freq:1.5}] },
];

// ─── SoundCloud presets ──────────────────────────────────────────────────────
const SC_PLAYLISTS = [
  { id:"meditation",   label:"Meditation Music",      url:"https://soundcloud.com/meditation-music",                        tag:"ambient"   },
  { id:"ambientflow",  label:"Ambient Flow State",    url:"https://soundcloud.com/sc-playlists-asse/sets/ambient-flow-state",tag:"ambient"   },
  { id:"chillstep",    label:"Best of Chillstep",     url:"https://soundcloud.com/best-of-chillstep",                       tag:"chill"     },
  { id:"funktastic",   label:"Funktastic",            url:"https://soundcloud.com/sc-playlists/sets/funktastic",            tag:"groove"    },
  { id:"fruitloops",   label:"Fruit Loops",           url:"https://soundcloud.com/sc-playlists/sets/fruit-loops",           tag:"groove"    },
  { id:"feelgoodflow", label:"Feel Good Flows",       url:"https://soundcloud.com/sc-playlists/sets/feel-good-flows",       tag:"feel-good" },
  { id:"edmuplift",    label:"EDM Uplift",            url:"https://soundcloud.com/sc-playlists/sets/edm-uplift",            tag:"energy"    },
  { id:"airguitar",    label:"Air Guitar",            url:"https://soundcloud.com/sc-playlists/sets/air-guitar",            tag:"energy"    },
  { id:"soulsearch",   label:"Soul Searching",        url:"https://soundcloud.com/sc-playlists/sets/soul-searching",        tag:"soul"      },
  { id:"imposter",     label:"Imposter Syndrome",     url:"https://soundcloud.com/sc-playlists/sets/imposter-syndrome",     tag:"focus"     },
  { id:"feelgoodhouse",label:"Feel Good House",       url:"https://soundcloud.com/sc-playlists/sets/feel-good-house",       tag:"groove"    },
  { id:"ambientreset", label:"Ambient Reset",         url:"https://soundcloud.com/sc-playlists/sets/ambient-reset",         tag:"ambient"   },
  { id:"studysymphony",label:"Study Symphonies",      url:"https://soundcloud.com/sc-playlists/sets/study-symphonies",      tag:"focus"     },
  { id:"soulfocus",    label:"Soul Focus",            url:"https://soundcloud.com/sc-playlists/sets/soul-focus",            tag:"soul"      },
  { id:"multitask",    label:"Multitask Melodies",    url:"https://soundcloud.com/sc-playlists/sets/multitask-melodies",    tag:"focus"     },
  { id:"classical",    label:"Classical GM",          url:"https://soundcloud.com/classicalgm",                             tag:"classical" },
  { id:"bestclassical",label:"Best of Classical",     url:"https://soundcloud.com/bestofclassicalmusic",                    tag:"classical" },
];

const SC_TAGS = ["all","ambient","focus","chill","feel-good","groove","energy","soul","classical"];

const TAG_COLORS = {
  ambient:"#10d98a", focus:"#f5c400", chill:"#4d4dff",
  "feel-good":"#ff9f43", groove:"#ff5555", energy:"#ff3f8e",
  soul:"#a855f7", classical:"#7b8cde", all:"rgba(255,255,255,0.4)",
};
const WORK_DURATION  = 25 * 60;
const BREAK_DURATION = 5  * 60;
const APP_BG         = "#071a12";
const APP_ACCENT     = "#10d98a";
const APP_GLOW       = "rgba(16,217,138,0.35)";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const pad = n => String(n).padStart(2,"0");
const fmt = s => `${pad(Math.floor(s/60))}:${pad(s%60)}`;
const lerp = (a,b,t) => a+(b-a)*t;
function todayKey(){ const d=new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function friendlyDate(key){
  const [y,m,d]=key.split("-");
  return new Date(y,m-1,d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
}
function getFreqAt(points,t){
  if(t<=points[0].t) return points[0].freq;
  if(t>=points[points.length-1].t) return points[points.length-1].freq;
  for(let i=0;i<points.length-1;i++){
    if(t>=points[i].t&&t<=points[i+1].t){
      return lerp(points[i].freq,points[i+1].freq,(t-points[i].t)/(points[i+1].t-points[i].t));
    }
  }
  return points[0].freq;
}
function getZone(freq){
  if(freq<4)  return {name:"Delta",color:"#4d4dff"};
  if(freq<8)  return {name:"Theta",color:"#a855f7"};
  if(freq<13) return {name:"Alpha",color:"#10d98a"};
  if(freq<30) return {name:"Beta", color:"#f5c400"};
  return {name:"Gamma",color:"#ff5555"};
}
function curvePath(points,duration,W,H,px=12,py=10){
  const toX=t=>px+(t/duration)*(W-px*2);
  const toY=f=>H-py-(f/44)*(H-py*2);
  let d=`M ${toX(points[0].t)} ${toY(points[0].freq)}`;
  for(let i=1;i<points.length;i++){
    const p=points[i-1],c=points[i],cx=toX((p.t+c.t)/2);
    d+=` C ${cx} ${toY(p.freq)}, ${cx} ${toY(c.freq)}, ${toX(c.t)} ${toY(c.freq)}`;
  }
  return d;
}
function loadLog(){ try{ return JSON.parse(localStorage.getItem("fs_log")||"{}"); }catch{ return {}; } }
function saveLog(log){ try{ localStorage.setItem("fs_log",JSON.stringify(log)); }catch{} }

// ─── Main ────────────────────────────────────────────────────────────────────
export default function FlowState(){

  // Pomodoro
  const [pomPhase,   setPomPhase]   = useState("idle");   // idle | work | break
  const [pomElapsed, setPomElapsed] = useState(0);
  const [taskInput,  setTaskInput]  = useState("");
  const [curTask,    setCurTask]    = useState("");
  const [sessCount,  setSessCount]  = useState(0);
  const [log,        setLog]        = useState(loadLog);
  const [showReport, setShowReport] = useState(false);

  // Sound mode selection (shown before session starts)
  const [soundMode, setSoundMode]   = useState("manual"); // "manual" | "journey" | "none"
  const [showSoundCfg, setShowSoundCfg] = useState(false);

  // Manual wave
  const [selWave,  setSelWave]  = useState(WAVES[2]);
  const [beatFreq, setBeatFreq] = useState(WAVES[2].beat);
  const [binMode,  setBinMode]  = useState("binaural");

  // Journey
  const [selJourney, setSelJourney] = useState(JOURNEYS[0]);
  const [journeyFreq,setJourneyFreq]= useState(JOURNEYS[0].points[0].freq);

  // SoundCloud
  const [scUrl,      setScUrl]      = useState("");
  const [scInput,    setScInput]    = useState("");
  const [scVolume,   setScVolume]   = useState(0.6);
  const [scReady,    setScReady]    = useState(false);
  const [scPlaying,  setScPlaying]  = useState(false);
  const [scSelId,    setScSelId]    = useState("");
  const [scShuffle,  setScShuffle]  = useState(false);
  const [scTagFilter,setScTagFilter]= useState("all");
  const scWidgetRef  = useRef(null);
  const scIframeRef  = useRef(null);

  // Audio
  const [volume,     setVolume]    = useState(0.25);
  const [audioErr,   setAudioErr]  = useState(false);
  const [playing,    setPlaying]   = useState(false);
  const [elapsed,    setElapsed]   = useState(0);
  const [breathPhase,setBreathPhase]=useState("inhale");
  const [breathProg, setBreathProg]=useState(0);

  // Refs
  const ctxRef         = useRef(null);
  const leftRef        = useRef(null);
  const rightRef       = useRef(null);
  const isoOscRef      = useRef(null);
  const isoGainRef     = useRef(null);
  const masterRef      = useRef(null);
  const isoIntRef      = useRef(null);
  const journeyIntRef  = useRef(null);
  const audioTimerRef  = useRef(null);
  const breathRef      = useRef(null);
  const breathStartRef = useRef(null);
  const elapsedRef     = useRef(0);
  const pomTimerRef    = useRef(null);
  const pomElapsedRef  = useRef(0);

  // ── Audio engine ────────────────────────────────────────────────────────────
  const killAudio = useCallback(()=>{
    try{ leftRef.current?.stop(); }catch{}
    try{ rightRef.current?.stop(); }catch{}
    try{ isoOscRef.current?.stop(); }catch{}
    leftRef.current=rightRef.current=isoOscRef.current=isoGainRef.current=masterRef.current=null;
    if(isoIntRef.current)     clearInterval(isoIntRef.current);
    if(journeyIntRef.current) clearInterval(journeyIntRef.current);
    if(audioTimerRef.current) clearInterval(audioTimerRef.current);
    try{ ctxRef.current?.close(); }catch{}
    ctxRef.current=null;
    if(breathRef.current) cancelAnimationFrame(breathRef.current);
    breathRef.current=breathStartRef.current=null;
  },[]);

  const startIso = useCallback((ctx,gain,freq)=>{
    if(isoIntRef.current) clearInterval(isoIntRef.current);
    const ms=Math.max(1000/Math.max(freq,0.5),20);
    let on=true;
    gain.gain.setValueAtTime(0.28,ctx.currentTime);
    isoIntRef.current=setInterval(()=>{ try{ gain.gain.setValueAtTime(on?0.28:0,ctx.currentTime); }catch{} on=!on; },ms/2);
  },[]);

  const startBreath = useCallback((rate)=>{
    if(breathRef.current) cancelAnimationFrame(breathRef.current);
    const cycle=(60/rate)*1000, half=cycle/2;
    breathStartRef.current=null;
    const tick=ts=>{
      if(!breathStartRef.current) breathStartRef.current=ts;
      const e=(ts-breathStartRef.current)%cycle, inh=e<half;
      setBreathPhase(inh?"inhale":"exhale");
      setBreathProg(inh?e/half:(e-half)/half);
      breathRef.current=requestAnimationFrame(tick);
    };
    breathRef.current=requestAnimationFrame(tick);
  },[]);

  const buildGraph = useCallback((ctx,carrier,beatF,bMode,vol)=>{
    const mg=ctx.createGain();
    mg.gain.setValueAtTime(0,ctx.currentTime);
    mg.gain.linearRampToValueAtTime(vol,ctx.currentTime+1.5);
    mg.connect(ctx.destination);
    masterRef.current=mg;
    if(bMode==="binaural"){
      const merger=ctx.createChannelMerger(2); merger.connect(mg);
      const lg=ctx.createGain(); lg.gain.value=1; lg.connect(merger,0,0);
      const rg=ctx.createGain(); rg.gain.value=1; rg.connect(merger,0,1);
      const lo=ctx.createOscillator(); lo.type="sine"; lo.frequency.value=carrier; lo.connect(lg); lo.start(); leftRef.current=lo;
      const ro=ctx.createOscillator(); ro.type="sine"; ro.frequency.value=carrier+beatF; ro.connect(rg); ro.start(); rightRef.current=ro;
    } else {
      const ig=ctx.createGain(); ig.gain.value=0; ig.connect(mg); isoGainRef.current=ig;
      const io=ctx.createOscillator(); io.type="sine"; io.frequency.value=carrier; io.connect(ig); io.start(); isoOscRef.current=io;
      startIso(ctx,ig,beatF);
    }
  },[startIso]);

  const launchAudio = useCallback((carrier,beatF,breathRate,vol,bMode)=>{
    setAudioErr(false);
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      ctxRef.current=ctx;
      buildGraph(ctx,carrier,beatF,bMode,vol);
      startBreath(breathRate);
      setElapsed(0); elapsedRef.current=0;
      audioTimerRef.current=setInterval(()=>{ elapsedRef.current+=1; setElapsed(e=>e+1); },1000);
      setPlaying(true);
      return true;
    }catch(e){ console.error(e); setAudioErr(true); return false; }
  },[buildGraph,startBreath]);

  const fadeAndKill = useCallback(()=>{
    try{
      if(ctxRef.current&&masterRef.current){
        masterRef.current.gain.linearRampToValueAtTime(0,ctxRef.current.currentTime+0.8);
        setTimeout(killAudio,900);
      } else killAudio();
    }catch{ killAudio(); }
    if(breathRef.current){ cancelAnimationFrame(breathRef.current); breathRef.current=null; }
    if(audioTimerRef.current) clearInterval(audioTimerRef.current);
    setPlaying(false); setElapsed(0); elapsedRef.current=0;
    setBreathPhase("inhale"); setBreathProg(0);
  },[killAudio]);

  // Live volume
  useEffect(()=>{
    if(!playing||!masterRef.current||!ctxRef.current) return;
    masterRef.current.gain.setValueAtTime(volume,ctxRef.current.currentTime);
  },[volume,playing]);

  // Live beat freq (manual binaural)
  useEffect(()=>{
    if(!playing||soundMode!=="manual"||binMode!=="binaural") return;
    if(rightRef.current&&ctxRef.current) rightRef.current.frequency.setValueAtTime(selWave.carrier+beatFreq,ctxRef.current.currentTime);
  },[beatFreq,playing,soundMode,binMode,selWave.carrier]);

  useEffect(()=>()=>killAudio(),[killAudio]);

  // ── SoundCloud widget ───────────────────────────────────────────────────────
  useEffect(()=>{
    if(document.getElementById("sc-widget-api")) return;
    const s=document.createElement("script");
    s.id="sc-widget-api";
    s.src="https://w.soundcloud.com/player/api.js";
    s.async=true;
    document.head.appendChild(s);
  },[]);

  // Bind widget after iframe loads
  useEffect(()=>{
    if(!scUrl||!scIframeRef.current) return;
    let attempts=0;
    let timeout;
    scWidgetRef.current=null;
    setScReady(false);
    setScPlaying(false);

    const tryBind=()=>{
      attempts++;
      if(attempts>40){ console.warn("SC Widget API not available"); return; }
      if(!window.SC||!window.SC.Widget){
        timeout=setTimeout(tryBind,500);
        return;
      }
      try{
        const widget=window.SC.Widget(scIframeRef.current);
        scWidgetRef.current=widget;
        widget.bind(window.SC.Widget.Events.READY,()=>{
          widget.setVolume(Math.round(scVolume*100));
          if(scShuffle) try{ widget.setShuffle(true); }catch{}
          setScReady(true);
        });
        widget.bind(window.SC.Widget.Events.PLAY,  ()=>setScPlaying(true));
        widget.bind(window.SC.Widget.Events.PAUSE, ()=>setScPlaying(false));
        widget.bind(window.SC.Widget.Events.FINISH,()=>setScPlaying(false));
      }catch(e){
        console.warn("SC bind error",e);
        timeout=setTimeout(tryBind,500);
      }
    };

    // Wait for iframe to load before binding
    const iframe=scIframeRef.current;
    const onLoad=()=>{ timeout=setTimeout(tryBind,600); };
    iframe.addEventListener("load",onLoad);

    return ()=>{
      clearTimeout(timeout);
      iframe.removeEventListener("load",onLoad);
      scWidgetRef.current=null;
      setScReady(false);
      setScPlaying(false);
    };
  },[scUrl]); // eslint-disable-line

  // Live SC volume
  useEffect(()=>{
    if(scWidgetRef.current&&scReady) scWidgetRef.current.setVolume(Math.round(scVolume*100));
  },[scVolume,scReady]);

  const scTogglePlay=useCallback(()=>{
    if(!scWidgetRef.current||!scReady) return;
    scPlaying ? scWidgetRef.current.pause() : scWidgetRef.current.play();
  },[scReady,scPlaying]);

  const scLoadUrl=useCallback(()=>{
    const raw=scInput.trim();
    if(!raw) return;
    setScReady(false); setScPlaying(false); setScSelId("");
    setScUrl(raw);
  },[scInput]);

  const scSelectPlaylist=useCallback((playlist)=>{
    setScReady(false); setScPlaying(false);
    setScSelId(playlist.id);
    setScInput(playlist.url);
    setScUrl(playlist.url);
  },[]);

  // ── Pomodoro engine ─────────────────────────────────────────────────────────
  const beep = useCallback((freq=660,dur=0.5)=>{
    try{
      const ctx=new(window.AudioContext||window.webkitAudioContext)();
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=freq; o.type="sine";
      g.gain.setValueAtTime(0.3,ctx.currentTime);
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime+dur);
      setTimeout(()=>ctx.close(),1200);
    }catch{}
  },[]);

  const logTask = useCallback((task)=>{
    const key=todayKey();
    setLog(prev=>{
      const next={...prev,[key]:[...(prev[key]||[]),{task,completedAt:new Date().toISOString()}]};
      saveLog(next); return next;
    });
    setSessCount(c=>c+1);
  },[]);

  const startBreakTimer = useCallback(()=>{
    setPomPhase("break");
    setPomElapsed(0); pomElapsedRef.current=0;
    pomTimerRef.current=setInterval(()=>{
      pomElapsedRef.current+=1;
      setPomElapsed(e=>e+1);
      if(pomElapsedRef.current>=BREAK_DURATION){
        clearInterval(pomTimerRef.current);
        beep(440,0.6);
        setPomPhase("idle"); setPomElapsed(0); pomElapsedRef.current=0;
        setTaskInput("");
      }
    },1000);
  },[beep]);

  const startWork = useCallback(()=>{
    const task=taskInput.trim();
    if(!task) return;
    setCurTask(task);
    setPomPhase("work");
    setPomElapsed(0); pomElapsedRef.current=0;

    // Launch audio based on mode
    if(soundMode==="manual"){
      launchAudio(selWave.carrier,beatFreq,selWave.breathRate,volume,binMode);
    } else if(soundMode==="journey"){
      const j=selJourney;
      const startFreq=j.points[0].freq;
      launchAudio(210,startFreq,6,volume,binMode);
      setJourneyFreq(startFreq);
      journeyIntRef.current=setInterval(()=>{
        const t=elapsedRef.current;
        if(t>=j.duration){ clearInterval(journeyIntRef.current); return; }
        const f=getFreqAt(j.points,t);
        setJourneyFreq(f);
        if(ctxRef.current){
          if(binMode==="binaural"&&rightRef.current) rightRef.current.frequency.setValueAtTime(210+f,ctxRef.current.currentTime);
          else if(binMode==="isochronic"&&isoGainRef.current) startIso(ctxRef.current,isoGainRef.current,f);
        }
      },2000);
    }
    // "none" = SoundCloud mode — auto-play SC widget if loaded
    if(soundMode==="none"&&scWidgetRef.current&&scReady){
      scWidgetRef.current.play();
    }

    clearInterval(pomTimerRef.current);
    pomTimerRef.current=setInterval(()=>{
      pomElapsedRef.current+=1;
      setPomElapsed(e=>e+1);
      if(pomElapsedRef.current>=WORK_DURATION){
        clearInterval(pomTimerRef.current);
        logTask(task);
        beep(660,0.6);
        if(soundMode!=="none") fadeAndKill();
        if(soundMode==="none"&&scWidgetRef.current&&scReady) scWidgetRef.current.pause();
        startBreakTimer();
      }
    },1000);
  },[taskInput,soundMode,selWave,beatFreq,binMode,volume,selJourney,scReady,launchAudio,startIso,logTask,beep,fadeAndKill,startBreakTimer]);

  const cancelSession = useCallback(()=>{
    clearInterval(pomTimerRef.current);
    pomElapsedRef.current=0;
    setPomPhase("idle"); setPomElapsed(0); setCurTask("");
    if(playing) fadeAndKill();
    if(soundMode==="none"&&scWidgetRef.current&&scReady) scWidgetRef.current.pause();
  },[playing,soundMode,scReady,fadeAndKill]);

  useEffect(()=>()=>clearInterval(pomTimerRef.current),[]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const pomTotal  = pomPhase==="break"?BREAK_DURATION:WORK_DURATION;
  const pomRemain = Math.max(pomTotal-pomElapsed,0);
  const pomPct    = Math.min(pomElapsed/pomTotal,1);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  // Curated Unsplash photos -- direct CDN URLs, always available
  const PHOTOS = [
    { url:"https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80", location:"Black Forest, Germany",       photographer:"v2osk"           },
    { url:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80", location:"Tromsø, Norway",              photographer:"Johannes Groll"  },
    { url:"https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80", location:"Lofoten Islands, Norway",     photographer:"Bailey Zindel"   },
    { url:"https://images.unsplash.com/photo-1520962880247-cfaf541c8724?w=1920&q=80", location:"Yosemite, California",        photographer:"Nathan Anderson"  },
    { url:"https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=80", location:"Zhangjiajie, China",          photographer:"Amos G"          },
    { url:"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80", location:"Dolomites, Italy",            photographer:"Kalen Emsley"    },
    { url:"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=80", location:"Patagonia, Argentina",        photographer:"Luca Bravo"      },
    { url:"https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&q=80", location:"Yosemite Valley, California", photographer:"Iswanto Arif"    },
    { url:"https://images.unsplash.com/photo-1511497584788-876760111969?w=1920&q=80", location:"Redwood National Park, CA",   photographer:"Lukasz Szmigiel" },
    { url:"https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1920&q=80", location:"Iceland",                    photographer:"Eberhard Grossgasteiger" },
    { url:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80", location:"Maldives",                   photographer:"Sean Oulashin"   },
    { url:"https://images.unsplash.com/photo-1682686581854-5e71f58e7e3f?w=1920&q=80", location:"Sahara Desert, Morocco",     photographer:"Neom"            },
    { url:"https://images.unsplash.com/photo-1546514714-df0ccc50d7bf?w=1920&q=80", location:"Banff, Canada",               photographer:"Tyler Lastovich"  },
    { url:"https://images.unsplash.com/photo-1478827387698-1527781a4887?w=1920&q=80", location:"Plitvice Lakes, Croatia",    photographer:"Roberto Nickson"  },
    { url:"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80", location:"Alps, Switzerland",          photographer:"Benjamin Voros"   },
  ];

  const [bgPhoto] = useState(()=> PHOTOS[Math.floor(Math.random() * PHOTOS.length)]);

  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;

    const resize = ()=>{
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Wave definitions: freq, amplitude, speed, phase, opacity
    const waves = [
      { freq:1.8, amp:0.06, speed:0.0008, phase:0,    alpha:0.18 },
      { freq:2.6, amp:0.04, speed:0.0012, phase:1.2,  alpha:0.14 },
      { freq:3.4, amp:0.05, speed:0.0006, phase:2.5,  alpha:0.10 },
      { freq:1.2, amp:0.03, speed:0.0015, phase:0.8,  alpha:0.08 },
      { freq:4.2, amp:0.025,speed:0.0020, phase:3.7,  alpha:0.07 },
      { freq:0.9, amp:0.07, speed:0.0005, phase:1.9,  alpha:0.06 },
    ];

    let t = 0;

    const draw = (ts)=>{
      t = ts * 0.001;
      ctx.clearRect(0, 0, W, H);

      waves.forEach((w, i)=>{
        // colour cycles gently between the accent palette
        const hues = [160, 260, 200, 140, 280, 180];
        const hue  = hues[i % hues.length];
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${hue}, 70%, 65%, ${w.alpha})`;
        ctx.lineWidth   = 1.2;

        for(let x=0; x<=W; x+=2){
          const nx  = x / W;
          // multi-sine for organic feel
          const y1  = Math.sin(nx * Math.PI * 2 * w.freq + t * w.speed * 6000 + w.phase) * w.amp;
          const y2  = Math.sin(nx * Math.PI * 2 * w.freq * 1.618 + t * w.speed * 4000 + w.phase * 1.3) * w.amp * 0.4;
          const y   = (0.5 + y1 + y2) * H;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return ()=>{
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, []);

  const todayTasks= (log[todayKey()]||[]);
  const reportDays= Object.keys(log).sort().reverse().slice(0,7);

  const accentColor = pomPhase==="break"?"#a855f7":soundMode==="manual"?selWave.accent:soundMode==="journey"?selJourney.accent:APP_ACCENT;
  const glowColor   = pomPhase==="break"?"rgba(168,85,247,0.35)":soundMode==="manual"?selWave.glow:soundMode==="journey"?selJourney.glow:APP_GLOW;

  const zone = getZone(soundMode==="journey"?journeyFreq:beatFreq);

  // Breath orb scale
  const minS=0.58,maxS=1.0;
  const orbScale = playing
    ? breathPhase==="inhale" ? minS+breathProg*(maxS-minS) : maxS-breathProg*(maxS-minS)
    : minS;

  const journeyPct = selJourney.duration>0?Math.min(elapsed/selJourney.duration,1):0;
  const SVG_W=280,SVG_H=70;

  // ── Slider component ────────────────────────────────────────────────────────
  const Slider=({label,value,min,max,step,onChange,display})=>(
    <div style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em"}}>{label}</span>
        <span style={{fontSize:12,fontFamily:"monospace",color:accentColor,letterSpacing:"0.08em"}}>{display}</span>
      </div>
      <div style={{position:"relative",height:24,display:"flex",alignItems:"center"}}>
        <div style={{position:"absolute",left:0,right:0,height:3,background:"rgba(255,255,255,0.1)",borderRadius:2}}/>
        <div style={{position:"absolute",left:0,width:`${((value-min)/(max-min))*100}%`,height:3,background:accentColor,borderRadius:2}}/>
        <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
          style={{position:"absolute",left:0,right:0,width:"100%",appearance:"none",WebkitAppearance:"none",background:"transparent",cursor:"pointer",outline:"none",margin:0,padding:0,height:24}}/>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:APP_BG,display:"flex",flexDirection:"column",alignItems:"center",fontFamily:"'Georgia',serif",padding:"28px 16px 60px",boxSizing:"border-box",position:"relative",overflow:"hidden"}}>

      {/* Nature photo background */}
      <div style={{
        position:"absolute",top:0,left:0,width:"100%",height:"100%",
        backgroundImage:`url(${bgPhoto.url})`,
        backgroundSize:"cover",backgroundPosition:"center",
        zIndex:0,
      }}/>

      {/* Dark overlay so UI stays legible */}
      <div style={{
        position:"absolute",top:0,left:0,width:"100%",height:"100%",
        background:"linear-gradient(to bottom, rgba(7,26,18,0.78) 0%, rgba(7,26,18,0.65) 50%, rgba(7,26,18,0.82) 100%)",
        zIndex:1,
      }}/>

      {/* Flowing brainwave canvas */}
      <canvas ref={canvasRef} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:2}}/>

      {/* Photo credit -- bottom left */}
      <div style={{
        position:"absolute",bottom:14,left:16,zIndex:4,
        display:"flex",flexDirection:"column",gap:1,
      }}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.55)",fontFamily:"monospace",letterSpacing:"0.08em"}}>
          📍 {bgPhoto.location}
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"monospace",letterSpacing:"0.06em"}}>
          Photo by {bgPhoto.photographer} · Unsplash
        </div>
      </div>

      {/* All content sits above canvas */}
      <div style={{position:"relative",zIndex:3,width:"100%",display:"flex",flexDirection:"column",alignItems:"center"}}>

      {/* Header */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:10,letterSpacing:"0.28em",color:accentColor,textTransform:"uppercase",marginBottom:6,fontFamily:"monospace",transition:"color 0.5s"}}>Neural Entrainment</div>
        <div style={{fontSize:26,fontWeight:400,color:"#efefef",letterSpacing:"0.06em"}}>Flow State</div>
      </div>

      {/* ── Ring timer ────────────────────────────────────────────────────── */}
      <div style={{position:"relative",width:210,height:210,marginBottom:16,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {/* Breath glow behind ring */}
        {playing&&(
          <div style={{position:"absolute",width:"100%",height:"100%",borderRadius:"50%",background:`radial-gradient(circle,${glowColor} 0%,transparent 65%)`,transform:`scale(${orbScale*1.4})`,opacity:0.5,transition:"none"}}/>
        )}
        <svg width="210" height="210" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}>
          <circle cx="105" cy="105" r="94" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5"/>
          <circle cx="105" cy="105" r="94" fill="none"
            stroke={accentColor} strokeWidth="5"
            strokeDasharray={`${2*Math.PI*94}`}
            strokeDashoffset={`${2*Math.PI*94*(1-pomPct)}`}
            strokeLinecap="round"
            style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}
          />
        </svg>
        <div style={{textAlign:"center",zIndex:1}}>
          <div style={{fontSize:40,fontFamily:"monospace",color:accentColor,letterSpacing:"0.04em",transition:"color 0.5s"}}>
            {fmt(pomRemain)}
          </div>
          <div style={{fontSize:9,fontFamily:"monospace",color:"rgba(255,255,255,0.3)",letterSpacing:"0.18em",marginTop:3,textTransform:"uppercase"}}>
            {pomPhase==="idle"?"ready":pomPhase==="work"?"focus":"break"}
          </div>
          {playing&&soundMode!=="none"&&(
            <div style={{fontSize:9,fontFamily:"monospace",color:accentColor+"88",marginTop:4,letterSpacing:"0.1em"}}>
              {breathPhase}
            </div>
          )}
        </div>
      </div>

      {/* Session dots */}
      <div style={{display:"flex",gap:6,marginBottom:22}}>
        {Array.from({length:Math.max(sessCount,4)}).map((_,i)=>(
          <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<sessCount?accentColor:"rgba(255,255,255,0.08)",transition:"background 0.4s"}}/>
        ))}
      </div>

      {/* ── Task input / current task ─────────────────────────────────────── */}
      {pomPhase==="idle"&&(
        <div style={{width:"100%",maxWidth:320,marginBottom:16}}>
          <div style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",marginBottom:7}}>TASK FOR THIS SESSION</div>
          <input value={taskInput} onChange={e=>setTaskInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&taskInput.trim()&&startWork()}
            placeholder="What are you working on?"
            style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,0.04)",border:`1px solid ${taskInput.trim()?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.07)"}`,borderRadius:8,padding:"12px 14px",color:"rgba(255,255,255,0.85)",fontSize:13,fontFamily:"monospace",outline:"none",transition:"border 0.3s"}}
          />
        </div>
      )}

      {pomPhase==="work"&&(
        <div style={{width:"100%",maxWidth:320,marginBottom:16,padding:"11px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${accentColor}33`,borderRadius:8,boxSizing:"border-box"}}>
          <div style={{fontSize:9,fontFamily:"monospace",color:"rgba(255,255,255,0.25)",letterSpacing:"0.14em",marginBottom:3}}>SINGLE FOCUS</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.82)",fontFamily:"monospace"}}>{curTask}</div>
        </div>
      )}

      {pomPhase==="break"&&(
        <div style={{width:"100%",maxWidth:320,marginBottom:16,padding:"11px 14px",background:"rgba(168,85,247,0.06)",border:"1px solid rgba(168,85,247,0.2)",borderRadius:8,textAlign:"center"}}>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",fontFamily:"monospace"}}>Session complete — take a break.</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:"monospace",marginTop:3}}>Next session starts automatically.</div>
        </div>
      )}

      {/* ── Sound mode panel ─────────────────────────────────────────────── */}
      {pomPhase==="idle"&&(
        <div style={{width:"100%",maxWidth:320,marginBottom:16,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>

          {/* Sound mode selector row */}
          <div style={{display:"flex",borderBottom:showSoundCfg?"1px solid rgba(255,255,255,0.07)":"none"}}>
            {[["manual","Frequency"],["journey","Journey"],["none","SoundCloud"]].map(([id,label])=>(
              <button key={id} onClick={()=>{setSoundMode(id); setShowSoundCfg(true);}} style={{
                flex:1,padding:"11px 4px",border:"none",
                background:soundMode===id?"rgba(255,255,255,0.06)":"transparent",
                borderBottom:soundMode===id?`2px solid ${accentColor}`:"2px solid transparent",
                color:soundMode===id?accentColor:"rgba(255,255,255,0.35)",
                fontSize:10,fontFamily:"monospace",letterSpacing:"0.07em",cursor:"pointer",outline:"none",
                transition:"all 0.25s",textAlign:"center",
              }}>{label}</button>
            ))}
          </div>

          {/* Expand/collapse toggle */}
          {!showSoundCfg&&(
            <button onClick={()=>setShowSoundCfg(true)} style={{width:"100%",padding:"8px",background:"transparent",border:"none",color:"rgba(255,255,255,0.2)",fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",letterSpacing:"0.08em"}}>
              configure ▾
            </button>
          )}

          {showSoundCfg&&(
            <div style={{padding:"14px 16px"}}>

              {/* Manual freq config */}
              {soundMode==="manual"&&(
                <>
                  {/* Wave selector */}
                  <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                    {WAVES.map(w=>(
                      <button key={w.id} onClick={()=>{setSelWave(w);setBeatFreq(w.beat);}} style={{
                        padding:"5px 10px",borderRadius:5,
                        border:`1px solid ${selWave.id===w.id?w.accent:"rgba(255,255,255,0.08)"}`,
                        background:selWave.id===w.id?"rgba(255,255,255,0.06)":"transparent",
                        color:selWave.id===w.id?w.accent:"rgba(255,255,255,0.35)",
                        fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",transition:"all 0.25s",
                      }}>{w.name}</button>
                    ))}
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"monospace",marginBottom:12,lineHeight:1.6}}>
                    {selWave.hz} &nbsp;·&nbsp; {selWave.label}
                  </div>
                  {/* Binaural / Isochronic */}
                  <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:5,padding:2,gap:2,marginBottom:14,width:"fit-content"}}>
                    {["binaural","isochronic"].map(m=>(
                      <button key={m} onClick={()=>setBinMode(m)} style={{
                        padding:"4px 10px",borderRadius:3,border:"none",
                        background:binMode===m?accentColor:"transparent",
                        color:binMode===m?APP_BG:"rgba(255,255,255,0.3)",
                        fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",fontWeight:binMode===m?700:400,textTransform:"capitalize",
                      }}>{m}</button>
                    ))}
                  </div>
                  <Slider label="BEAT FREQUENCY" value={beatFreq} min={selWave.minBeat} max={selWave.maxBeat}
                    step={selWave.maxBeat<=8?0.5:1} onChange={setBeatFreq}
                    display={`${beatFreq%1===0?beatFreq:beatFreq.toFixed(1)} Hz`}/>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.18)",fontFamily:"monospace",marginTop:8,lineHeight:1.6}}>
                    {binMode==="binaural"?"Stereo headphones required.":"Works on speakers."}
                  </div>
                </>
              )}

              {/* Journey config */}
              {soundMode==="journey"&&(
                <>
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>
                    {JOURNEYS.map(j=>(
                      <button key={j.id} onClick={()=>{setSelJourney(j);setJourneyFreq(j.points[0].freq);}} style={{
                        padding:"9px 12px",borderRadius:7,textAlign:"left",
                        border:`1px solid ${selJourney.id===j.id?j.accent:"rgba(255,255,255,0.07)"}`,
                        background:selJourney.id===j.id?"rgba(255,255,255,0.05)":"transparent",
                        cursor:"pointer",outline:"none",transition:"all 0.25s",
                      }}>
                        <span style={{fontSize:11,fontFamily:"monospace",color:selJourney.id===j.id?j.accent:"rgba(255,255,255,0.45)",letterSpacing:"0.05em"}}>{j.name}</span>
                        <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",fontFamily:"monospace",marginLeft:8}}>{fmt(j.duration)}</span>
                        <div style={{fontSize:9,color:"rgba(255,255,255,0.22)",fontFamily:"monospace",marginTop:2,lineHeight:1.5}}>{j.desc}</div>
                      </button>
                    ))}
                  </div>
                  {/* Binaural / Isochronic */}
                  <div style={{display:"flex",background:"rgba(255,255,255,0.05)",borderRadius:5,padding:2,gap:2,marginBottom:12,width:"fit-content"}}>
                    {["binaural","isochronic"].map(m=>(
                      <button key={m} onClick={()=>setBinMode(m)} style={{
                        padding:"4px 10px",borderRadius:3,border:"none",
                        background:binMode===m?selJourney.accent:"transparent",
                        color:binMode===m?APP_BG:"rgba(255,255,255,0.3)",
                        fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",fontWeight:binMode===m?700:400,textTransform:"capitalize",
                      }}>{m}</button>
                    ))}
                  </div>
                  {/* Mini curve preview */}
                  <div style={{background:"rgba(255,255,255,0.02)",borderRadius:6,padding:"8px 8px 4px",marginBottom:8}}>
                    <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{display:"block",overflow:"visible"}}>
                      {[{top:0.5,bot:4,c:"rgba(77,77,255,0.08)"},{top:4,bot:8,c:"rgba(168,85,247,0.08)"},{top:8,bot:13,c:"rgba(16,217,138,0.08)"},{top:13,bot:30,c:"rgba(245,196,0,0.05)"},{top:30,bot:44,c:"rgba(255,85,85,0.05)"}].map((b,i)=>{
                        const y1=SVG_H-8-((b.bot/44)*(SVG_H-16)), y2=SVG_H-8-((b.top/44)*(SVG_H-16));
                        return <rect key={i} x={10} y={y1} width={SVG_W-20} height={y2-y1} fill={b.c}/>;
                      })}
                      <path d={curvePath(selJourney.points,selJourney.duration,SVG_W,SVG_H)} fill="none" stroke={selJourney.accent} strokeWidth="1.5" strokeOpacity="0.6"/>
                      {playing&&pomPhase==="work"&&(
                        <>
                          <line x1={10+journeyPct*(SVG_W-20)} y1={8} x2={10+journeyPct*(SVG_W-20)} y2={SVG_H-8} stroke={selJourney.accent} strokeWidth="1" strokeOpacity="0.8"/>
                          <circle cx={10+journeyPct*(SVG_W-20)} cy={SVG_H-8-((journeyFreq/44)*(SVG_H-16))} r="3" fill={selJourney.accent} opacity="0.9"/>
                        </>
                      )}
                      {[0,0.5,1].map(p=>(
                        <text key={p} x={10+p*(SVG_W-20)} y={SVG_H+2} textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.18)" fontFamily="monospace">{fmt(Math.round(p*selJourney.duration))}</text>
                      ))}
                    </svg>
                  </div>
                  {playing&&soundMode==="journey"&&(
                    <div style={{fontSize:10,fontFamily:"monospace",color:zone.color,letterSpacing:"0.08em"}}>{zone.name} · {journeyFreq.toFixed(1)} Hz</div>
                  )}
                </>
              )}

              {/* SoundCloud config */}
              {soundMode==="none"&&(
                <div style={{paddingTop:4}}>

                  {/* Tag filter pills */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
                    {SC_TAGS.map(tag=>(
                      <button key={tag} onClick={()=>setScTagFilter(tag)} style={{
                        padding:"3px 9px",borderRadius:20,border:`1px solid ${scTagFilter===tag?TAG_COLORS[tag]:"rgba(255,255,255,0.08)"}`,
                        background:scTagFilter===tag?"rgba(255,255,255,0.06)":"transparent",
                        color:scTagFilter===tag?TAG_COLORS[tag]:"rgba(255,255,255,0.3)",
                        fontSize:9,fontFamily:"monospace",cursor:"pointer",outline:"none",
                        letterSpacing:"0.06em",transition:"all 0.2s",textTransform:"capitalize",
                      }}>{tag}</button>
                    ))}
                  </div>

                  {/* Playlist grid */}
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14,maxHeight:220,overflowY:"auto",paddingRight:2}}>
                    {SC_PLAYLISTS.filter(p=>scTagFilter==="all"||p.tag===scTagFilter).map(p=>(
                      <button key={p.id} onClick={()=>scSelectPlaylist(p)} style={{
                        padding:"9px 12px",borderRadius:7,textAlign:"left",
                        border:`1px solid ${scSelId===p.id?TAG_COLORS[p.tag]:"rgba(255,255,255,0.07)"}`,
                        background:scSelId===p.id?"rgba(255,255,255,0.05)":"transparent",
                        cursor:"pointer",outline:"none",transition:"all 0.2s",
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                      }}>
                        <span style={{fontSize:12,fontFamily:"monospace",color:scSelId===p.id?TAG_COLORS[p.tag]:"rgba(255,255,255,0.55)",letterSpacing:"0.03em"}}>{p.label}</span>
                        <span style={{fontSize:9,fontFamily:"monospace",color:TAG_COLORS[p.tag],opacity:0.7,marginLeft:8,whiteSpace:"nowrap",textTransform:"uppercase",letterSpacing:"0.06em"}}>{p.tag}</span>
                      </button>
                    ))}
                  </div>

                  {/* Shuffle toggle */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <span style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em"}}>SHUFFLE</span>
                    <button onClick={()=>{
                      const next=!scShuffle; setScShuffle(next);
                      if(scWidgetRef.current&&scReady) scWidgetRef.current.setShuffle(next);
                    }} style={{
                      padding:"4px 12px",borderRadius:20,border:`1px solid ${scShuffle?accentColor:"rgba(255,255,255,0.1)"}`,
                      background:scShuffle?"rgba(255,255,255,0.06)":"transparent",
                      color:scShuffle?accentColor:"rgba(255,255,255,0.25)",
                      fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",transition:"all 0.25s",
                    }}>{scShuffle?"On":"Off"}</button>
                  </div>

                  {/* Custom URL input */}
                  <div style={{fontSize:9,fontFamily:"monospace",color:"rgba(255,255,255,0.25)",letterSpacing:"0.08em",marginBottom:6}}>OR PASTE A CUSTOM URL</div>
                  <div style={{display:"flex",gap:6,marginBottom:12}}>
                    <input
                      value={scInput}
                      onChange={e=>setScInput(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&scLoadUrl()}
                      placeholder="soundcloud.com/artist/track"
                      style={{
                        flex:1,background:"rgba(255,255,255,0.04)",
                        border:`1px solid ${scInput.trim()?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.07)"}`,
                        borderRadius:6,padding:"8px 10px",color:"rgba(255,255,255,0.8)",
                        fontSize:11,fontFamily:"monospace",outline:"none",minWidth:0,
                      }}
                    />
                    <button onClick={scLoadUrl} style={{
                      padding:"8px 12px",borderRadius:6,border:`1px solid ${accentColor}`,
                      background:"transparent",color:accentColor,fontSize:10,
                      fontFamily:"monospace",cursor:"pointer",outline:"none",letterSpacing:"0.06em",whiteSpace:"nowrap",
                    }}>Load</button>
                  </div>

                  {/* Embedded player */}
                  {scUrl&&(
                    <div style={{marginBottom:12}}>
                      <iframe
                        ref={scIframeRef}
                        key={scUrl}
                        id="sc-player"
                        width="100%"
                        height="166"
                        scrolling="no"
                        frameBorder="no"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                        allowTransparency={true}
                        allowFullScreen={true}
                        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(scUrl)}&color=%2310d98a&auto_play=false&buying=false&liking=false&download=false&sharing=false&show_artwork=true&show_comments=false&show_playcount=false&show_user=true&hide_related=true&show_reposts=false&show_teaser=false&visual=false`}
                        style={{borderRadius:8,display:"block",border:"1px solid rgba(255,255,255,0.07)",background:"transparent"}}
                      />
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                        <button onClick={scTogglePlay} disabled={!scReady} style={{
                          padding:"6px 16px",borderRadius:6,
                          border:`1px solid ${scReady?accentColor:"rgba(255,255,255,0.1)"}`,
                          background:"transparent",
                          color:scReady?accentColor:"rgba(255,255,255,0.2)",
                          fontSize:10,fontFamily:"monospace",cursor:scReady?"pointer":"default",outline:"none",letterSpacing:"0.08em",
                        }}>{scPlaying?"⏸  Pause":"▶  Play"}</button>
                        <span style={{
                          fontSize:9,fontFamily:"monospace",letterSpacing:"0.08em",
                          color:!scReady?"rgba(255,165,0,0.6)":scPlaying?"rgba(16,217,138,0.7)":"rgba(255,255,255,0.2)",
                        }}>
                          {!scReady?"⏳ loading...":scPlaying?"● playing":"○ paused"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Music volume */}
                  {scUrl&&(
                    <Slider label="MUSIC VOLUME" value={scVolume} min={0} max={1} step={0.01}
                      onChange={setScVolume} display={`${Math.round(scVolume*100)}%`}/>
                  )}

                  <div style={{fontSize:9,color:"rgba(255,255,255,0.15)",fontFamily:"monospace",marginTop:10,lineHeight:1.7}}>
                    Tracks must be public on SoundCloud. Plays alongside brainwave tones.
                  </div>
                </div>
              )}

              {/* Tone volume (frequency + journey modes only) */}
              {soundMode!=="none"&&(
                <div style={{marginTop:14}}>
                  <Slider label="TONE VOLUME" value={volume} min={0} max={1} step={0.01}
                    onChange={setVolume} display={`${Math.round(volume*100)}%`}/>
                </div>
              )}

              {/* Collapse */}
              <button onClick={()=>setShowSoundCfg(false)} style={{marginTop:12,background:"transparent",border:"none",color:"rgba(255,255,255,0.18)",fontSize:10,fontFamily:"monospace",cursor:"pointer",outline:"none",letterSpacing:"0.08em",padding:0}}>
                collapse ▴
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio error */}
      {audioErr&&(
        <div style={{width:"100%",maxWidth:320,marginBottom:14,padding:"10px 14px",borderRadius:6,background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.25)",color:"rgba(255,130,130,0.9)",fontSize:11,fontFamily:"monospace",textAlign:"center"}}>
          Audio could not start. Try Chrome or Safari.
        </div>
      )}

      {/* ── Begin / Cancel ────────────────────────────────────────────────── */}
      {pomPhase==="idle"&&(
        <button onClick={startWork} disabled={!taskInput.trim()} style={{
          padding:"13px 52px",borderRadius:8,
          border:`1.5px solid ${taskInput.trim()?accentColor:"rgba(255,255,255,0.1)"}`,
          background:taskInput.trim()?accentColor:"transparent",
          color:taskInput.trim()?APP_BG:"rgba(255,255,255,0.2)",
          fontSize:12,fontFamily:"monospace",letterSpacing:"0.2em",textTransform:"uppercase",
          cursor:taskInput.trim()?"pointer":"default",transition:"all 0.3s",outline:"none",fontWeight:700,
        }}>Begin</button>
      )}

      {(pomPhase==="work"||pomPhase==="break")&&(
        <button onClick={cancelSession} style={{
          padding:"11px 40px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",
          background:"transparent",color:"rgba(255,255,255,0.3)",
          fontSize:11,fontFamily:"monospace",letterSpacing:"0.15em",textTransform:"uppercase",
          cursor:"pointer",outline:"none",transition:"all 0.3s",
        }}>Cancel</button>
      )}

      {/* ── Today's log ───────────────────────────────────────────────────── */}
      {todayTasks.length>0&&(
        <div style={{width:"100%",maxWidth:320,marginTop:28}}>
          <div style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.25)",letterSpacing:"0.1em",marginBottom:10}}>
            TODAY &nbsp;·&nbsp; {todayTasks.length} session{todayTasks.length!==1?"s":""} &nbsp;·&nbsp; {todayTasks.length*25} min
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {todayTasks.slice().reverse().map((t,i)=>(
              <div key={i} style={{padding:"8px 12px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"rgba(255,255,255,0.55)",fontFamily:"monospace"}}>{t.task}</span>
                <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:"monospace",marginLeft:10,whiteSpace:"nowrap"}}>25 min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Productivity report ───────────────────────────────────────────── */}
      {reportDays.length>0&&(
        <button onClick={()=>setShowReport(r=>!r)} style={{
          marginTop:20,padding:"8px 20px",borderRadius:6,border:"1px solid rgba(255,255,255,0.08)",
          background:"transparent",color:"rgba(255,255,255,0.25)",fontSize:10,
          fontFamily:"monospace",letterSpacing:"0.1em",cursor:"pointer",outline:"none",
        }}>{showReport?"Hide report":"Productivity report"}</button>
      )}

      {showReport&&(
        <div style={{width:"100%",maxWidth:320,marginTop:14,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"16px",boxSizing:"border-box"}}>
          <div style={{fontSize:10,fontFamily:"monospace",color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",marginBottom:16}}>PRODUCTIVITY REPORT</div>
          {reportDays.map(day=>{
            const tasks=log[day]||[];
            const maxS=Math.max(...reportDays.map(d=>(log[d]||[]).length),1);
            const isToday=day===todayKey();
            return (
              <div key={day} style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:11,fontFamily:"monospace",color:isToday?accentColor:"rgba(255,255,255,0.4)"}}>{isToday?"Today":friendlyDate(day)}</span>
                  <span style={{fontSize:9,fontFamily:"monospace",color:"rgba(255,255,255,0.25)"}}>{tasks.length} session{tasks.length!==1?"s":""} · {tasks.length*25} min</span>
                </div>
                <div style={{height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,marginBottom:7}}>
                  <div style={{height:3,width:`${Math.max((tasks.length/maxS)*100,4)}%`,background:isToday?accentColor:"rgba(255,255,255,0.18)",borderRadius:2,transition:"width 0.5s"}}/>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {tasks.map((t,i)=>(
                    <div key={i} style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontFamily:"monospace",paddingLeft:8,borderLeft:`2px solid ${isToday?accentColor+"44":"rgba(255,255,255,0.08)"}`}}>
                      {t.task}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        input::placeholder{color:rgba(255,255,255,0.18);}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${accentColor};border:2px solid ${APP_BG};cursor:pointer;}
        input[type=range]::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:${accentColor};border:2px solid ${APP_BG};cursor:pointer;}
      `}</style>
      </div>
    </div>
  );
}
