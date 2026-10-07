import { html, useState, useEffect, useRef, X, useSt, DC, CH, CMD, SR, M } from './utils.js';
import { Login, Calibration, Home, Tools, Learn, Voice, Done, RecForm } from './views.js';
import { Portal } from './portal.js';

export function App() {
    const [view, setView] = useState("login");
    const [role, setRole] = useState("siswa"); // siswa, guru, ortu
    const [page, setPage] = useState("dash");
    const [mod, setMod] = useState("cuci");
    const [ti, setTi] = useState(0);
    const [snd, setSnd] = useState(true);
    const [mic, setMic] = useState(true);
    const [sess, setSess] = useState(null);
    const [last, setLast] = useState(null);
    const [pend, setPend] = useState(null);
    const [cur, setCur] = useState(null);
    const [rec, setRec] = useState(null);
    const [tst, setTst] = useState(null);
    const [speaking, setSp] = useState(false);
    const [listening, setLi] = useState(false);
    
    // Add 'calibrated' state to cfg
    const extendedDC = { ...DC, calibrated: false };
    const [cfg, setCfg] = useSt("bisa2:cfg", extendedDC);
    const [hist, setHist] = useSt("bisa2:hist", []);
    const [notes, setNotes] = useSt("bisa2:notes", []);
    const [calls, setCalls] = useSt("bisa2:calls", []);
    const [voice, setVoice] = useSt("bisa3:voice", {ch:"kak", uri:"", rate:1, pitch:1});
    const [scripts, setScripts] = useSt("bisa3:script", {});
    
    const recR = useRef(null);
    const want = useRef(false);
    const lastAt = useRef(0);
    const onCmd = useRef(() => {});
    
    const toast = t => { setTst(t); setTimeout(() => setTst(null), 2600); };
    
    const speak = (t, o={}) => {
        if (!t || (!snd && !o.force)) return;
        try {
            const ss = speechSynthesis;
            ss.cancel();
            const u = new SpeechSynthesisUtterance(t);
            const ch = CH[o.ch || voice.ch] || CH.kak;
            const vv = ss.getVoices();
            u.lang = "id-ID";
            const v = vv.find(a => a.voiceURI === voice.uri) || vv.find(a => /^id/i.test(a.lang));
            if (v) u.voice = v;
            u.rate = Math.min(2, (voice.rate || 1) * ch.rate);
            u.pitch = Math.min(2, (voice.pitch || 1) * ch.pitch);
            u.onstart = () => setSp(true);
            u.onend = u.onerror = () => setSp(false);
            ss.speak(u);
        } catch(e) {}
    };
    
    const narr = (m, i, lvl, rev) => {
        const c = scripts[m.id+i];
        const x = m.steps[i];
        if (lvl === "mandiri" && !rev) return "";
        return c || (lvl === "ringkas" && !rev ? x[1] : x[1]+". "+x[2]);
    };
    
    const stopRec = () => {
        want.current = false;
        if (recR.current) { try { recR.current.stop(); } catch(e) {} }
        recR.current = null;
        setLi(false);
    };
    
    const startRec = () => {
        if (!SR || recR.current) return;
        const r = new SR();
        recR.current = r;
        r.lang = "id-ID";
        r.continuous = true;
        r.interimResults = true;
        
        r.onresult = e => {
            let t = "";
            for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript + " ";
            t = t.toLowerCase();
            for (const k in CMD) {
                if (CMD[k].test(t)) {
                    if (Date.now() - lastAt.current > 1800) {
                        lastAt.current = Date.now();
                        onCmd.current(k);
                    }
                    break;
                }
            }
        };
        
        r.onerror = e => {
            if (/not-allowed|service/.test(e.error)) {
                want.current = false;
                setMic(false);
            }
        };
        
        r.onend = () => {
            recR.current = null;
            setLi(false);
            if (want.current) setTimeout(() => want.current && startRec(), 300);
        };
        
        try { r.start(); setLi(true); } catch(e) { recR.current = null; }
    };
    
    onCmd.current = cmd => {
        if (view === "voice") setLast(cmd);
        else if (view === "learn" && !pend) setPend(cmd);
    };
    
    useEffect(() => {
        const on = (view === "learn" || view === "voice") && mic && SR;
        if (on) { want.current = true; startRec(); }
        else stopRec();
    }, [view, mic]);
    
    useEffect(() => { window.scrollTo(0, 0); }, [view, page]);
    
    useEffect(() => {
        if (!pend) return;
        const t = setTimeout(() => {
            const c = pend;
            setPend(null);
            run(c, "suara");
        }, 2000);
        return () => clearTimeout(t);
    }, [pend]);
    
    const go = (v, p) => {
        setPend(null);
        setSp(false);
        try { speechSynthesis.cancel(); } catch(e) {}
        setView(v);
        if (p) setPage(p);
    };
    
    const callHelp = () => { setCalls([...calls, Date.now()]); toast("Bantuan dipanggil"); };
    
    const startLearn = (id) => {
        const m = M(typeof id === "string" ? id : mod);
        setMod(m.id);
        setSess({mod: m.id, level: cfg.level, i: 0, log: [], help: m.steps.map(() => 0), start: Date.now(), reveal: false, rep: 0});
        go("learn");
    };
    
    const finish = s => {
        const m = M(s.mod);
        setHist([{id: s.start, mod: m.id, name: m.name, level: s.level, dur: Math.round((Date.now()-s.start)/1000), cmds: s.log.length, voice: s.log.filter(l => l.src === "suara").length, help: s.help.reduce((a, b) => a+b, 0), helps: s.help, steps: m.steps.map(x => x[1]), obs: null, note: "", done: true}, ...hist].slice(0, 200));
        setCur(s.start);
        go("done");
    };
    
    const run = (cmd, src) => {
        setPend(null);
        const s = sess;
        if (!s) return;
        const n = M(s.mod).steps.length;
        const ns = {...s, log: [...s.log, {cmd, src}]};
        
        if (cmd === "selesai" || (cmd === "lanjut" && s.i >= n - 1)) return finish(ns);
        if (cmd === "lanjut") { ns.i++; ns.reveal = false; }
        else if (cmd === "bantuan") { ns.reveal = true; ns.help = s.help.map((h, i) => i === s.i ? h + 1 : h); }
        else if (cmd === "ulangi") ns.rep = (s.rep || 0) + 1;
        
        setSess(ns);
        setView("learn");
    };
    
    const ctx = {view, go, role, setRole, page, setPage, mod, setMod, ti, setTi, snd, setSnd, mic, sess, setSess, last, setLast, cur, rec, setRec, cfg, setCfg, hist, setHist, notes, setNotes, calls, setCalls, voice, setVoice, scripts, setScripts, speak, speaking, narr, toast, listening, startLearn, run, callHelp};
    
    const V = {login: Login, calibration: Calibration, home: Home, tools: Tools, learn: Learn, voice: Voice, done: Done, portal: Portal}[view];
    
    return html`<${X.Provider} value=${ctx}>
        <${V}/>
        ${pend && view === "learn" && html`<div class="overlay" key=${pend}>
            <div class="popup">
                <span class="pill v mb-4">PERINTAH TERDETEKSI</span>
                <h2 class="text-pri" style=${{fontSize: '3rem', margin: '16px 0'}}>"${pend[0].toUpperCase()+pend.slice(1)}"</h2>
                <div class="row" style=${{marginTop:24, justifyContent:"center"}}>
                    <button class="btn" onClick=${()=>run(pend,"suara")}>Laksanakan!</button>
                    <button class="btn w" onClick=${()=>setPend(null)}>Batalkan</button>
                </div>
            </div>
        </div>`}
        ${rec && html`<${RecForm} key=${rec.id}/>`}
        ${tst && html`<div class="tt" key=${tst}>${tst}</div>`}
    <//>`;
}
