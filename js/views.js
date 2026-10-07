import { html, useState, useEffect, useMemo, useX, M, MODS, CH, today, fmt, score, starsToday, LV, OB, TONES } from './utils.js';
import { Btn, Mascot, Shell, MicBar, ProgressCircle, MicPermission } from './components.js';

const SvgIcon = ({p}) => html`<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" dangerouslySetInnerHTML=${{__html: p}}></svg>`;
const childSvg = `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
const teacherSvg = `<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path><path d="M8 7h6"></path><path d="M8 11h8"></path>`;
const parentSvg = `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>`;

export function Login() {
    const { go, setRole, cfg } = useX();
    return html`<div class="splash-wrap">
        <div class="hero-banner" style=${{margin: 0, flexDirection: 'column', textAlign: 'center'}}>
            <${Mascot} size=${160} />
            <div class="hero-text" style=${{marginTop: 20}}>
                <h1 style=${{fontSize: '4rem'}}>BISA</h1>
                <p style=${{fontSize: '1.5rem', margin: 0}}>Bina Interaktif Suara-Aksi</p>
            </div>
        </div>
        <div class="role-box">
            <div class="role-card" onClick=${() => { setRole("siswa"); go(cfg.calibrated ? "home" : "calibration"); }}>
                <div class="role-icon"><${SvgIcon} p=${childSvg} /></div>
                <h3>Siswa</h3><p class="sm mute">Mulai belajar!</p>
            </div>
            <div class="role-card" onClick=${() => { setRole("guru"); go("portal", "dash"); }}>
                <div class="role-icon" style=${{color: '#00E676'}}><${SvgIcon} p=${teacherSvg} /></div>
                <h3>Guru</h3><p class="sm mute">Pantau aktivitas</p>
            </div>
            <div class="role-card" onClick=${() => { setRole("ortu"); go("portal", "dash"); }}>
                <div class="role-icon" style=${{color: '#FFB300'}}><${SvgIcon} p=${parentSvg} /></div>
                <h3>Orang Tua</h3><p class="sm mute">Latihan di rumah</p>
            </div>
        </div>
    </div>`;
}

export function Calibration() {
    const { cfg, setCfg, go, speak } = useX();
    const [step, setStep] = useState(0);
    const [scoreVal, setScoreVal] = useState(0);

    const questions = [
        { q: "Bisakah anak menyentuh bagian yang terang pada layar secara mandiri?", yes: 1 },
        { q: "Apakah anak merespons dengan baik terhadap instruksi lisan sederhana (contoh: 'ambil', 'taruh')?", yes: 1 },
        { q: "Bisakah anak mengikuti panduan suara berdurasi singkat tanpa kehilangan fokus?", yes: 1 }
    ];

    const handleAnswer = (yes) => {
        const newScore = scoreVal + (yes ? questions[step].yes : 0);
        if (step < questions.length - 1) {
            setScoreVal(newScore);
            setStep(step + 1);
        } else {
            let lvl = "penuh";
            if (newScore === 3) lvl = "mandiri";
            else if (newScore === 2) lvl = "ringkas";
            
            setCfg({...cfg, calibrated: true, level: lvl});
            speak("Analisis selesai. Profil "+cfg.child+" telah disesuaikan!");
            go("home");
        }
    };

    return html`<div class="splash-wrap">
        <div class="popup" style=${{animation: 'none'}}>
            <h2 class="text-pri mb-4">Kalibrasi Awal Siswa</h2>
            <p class="mute mb-4">Sebagai analisis sementara untuk tunagrahita, jawab pertanyaan singkat ini untuk menentukan tingkat bantuan (scaffolding) otomatis untuk <b>${cfg.child}</b>.</p>
            <div class="glass card" style=${{background: 'var(--bg2)', textAlign: 'center'}}>
                <h3 class="text-pri">Pertanyaan ${step+1} dari ${questions.length}</h3>
                <p style=${{fontSize: '1.2rem', margin: '20px 0'}}>${questions[step].q}</p>
                <div class="row" style=${{justifyContent: 'center'}}>
                    <${Btn} onClick=${()=>handleAnswer(true)}>Ya, Bisa<//>
                    <${Btn} c="w" onClick=${()=>handleAnswer(false)}>Belum Bisa<//>
                </div>
            </div>
        </div>
    </div>`;
}

export function Home() {
    const {cfg, hist, go, setMod, setTi, speak} = useX();
    const [askMic, setAskMic] = useState(false);
    
    useEffect(() => {
        if(navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({name: 'microphone'}).then(res => {
                if (res.state === 'prompt') setAskMic(true);
            }).catch(()=>setAskMic(true));
        } else setAskMic(true);
    }, []);

    const tot = starsToday(hist);
    const p = Math.round((tot/10)*100) || 0;

    return html`<${Shell} on="home">
        ${askMic && html`<${MicPermission} onAllow=${(granted)=>{ setAskMic(false); if(granted) speak("Asyik! Mikrofon sudah menyala."); }} />`}
        <div class="hero-banner">
            <div class="hero-text">
                <h1>Ayo Belajar, ${cfg.child}!</h1>
                <p>Pilih modul di bawah untuk memulai petualangan mandirimu hari ini.</p>
                <${Btn} c="o" onClick=${()=>{setMod("cuci"); setTi(0); go("tools");}}>Mulai Latihan Pertama<//>
            </div>
            <${Mascot} size=${180} onClick=${()=>speak("Halo! Ayo kita selesaikan misi hari ini.")} />
        </div>
        
        <div class="rowb mb-4">
            <h2>Modul Latihan Bina Diri</h2>
            <div class="glass" style=${{padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 20}}>
                <div>
                    <h3 class="text-pri">Target Harian</h3>
                    <p class="sm mute" style=${{margin:0}}>Bintang terkumpul</p>
                </div>
                <${ProgressCircle} percent=${p} label="Bintang" />
            </div>
        </div>

        <div class="grid">
            ${MODS.map((m, i) => html`
            <div key=${m.id} class="item-card" onClick=${()=>{setMod(m.id); setTi(0); go("tools");}}>
                <div class="item-icon">${m.tools[0][0]}</div>
                <h3 class="text-pri">${m.name}</h3>
                <p class="sm mute mt-4">${m.steps.length} Langkah Mudah</p>
                <${Btn} c=${["","g","o"][i]} style=${{width: '100%', marginTop: 16}}>Buka Modul<//>
            </div>`)}
        </div>
    <//>`;
}

export function Tools() {
    const {mod, ti, setTi, go, startLearn, speak} = useX();
    const m = M(mod);
    const t = m.tools[ti];
    const last = ti === m.tools.length - 1;
    const say = () => speak(t[1]+". "+t[2]);
    useEffect(say, [mod, ti]);
    return html`<${Shell} on="learn">
        <div class="card glass c" style=${{maxWidth: 700, margin: '0 auto'}}>
            <span class="pill v mb-4">Pengenalan Alat ${ti+1}/${m.tools.length}</span>
            <div class="item-icon" style=${{width: 200, height: 200, fontSize: 80, cursor: 'pointer', borderRadius: '50%'}} onClick=${say}>${t[0]}</div>
            <h1 class="text-pri" style=${{fontSize: '3rem'}}>${t[1]}</h1>
            <p class="mute mb-4" style=${{fontSize: '1.4rem'}}>${t[2]}</p>
            <div class="row" style=${{justifyContent: 'center', margin: '30px 0'}}>
                <${Btn} c="w" onClick=${()=>ti ? setTi(ti-1) : go("home")}>Kembali<//>
                <${Btn} onClick=${say}>Dengar Suara<//>
                <${Btn} c="o" onClick=${()=>last ? startLearn() : setTi(ti+1)}>${last ? "Mulai Praktik" : "Alat Selanjutnya"}<//>
            </div>
        </div>
    <//>`;
}

export function Learn() {
    const {sess:s, run, speak, speaking, narr} = useX();
    if (!s) return null;
    const m = M(s.mod);
    const x = m.steps[s.i];
    const n = m.steps.length;
    const hide = s.level === "mandiri" && !s.reveal;
    const det = s.level === "penuh" || s.reveal;
    const txt = narr(m, s.i, s.level, s.reveal);
    
    useEffect(() => { speak(txt); }, [s.i, s.reveal, s.rep, s.mod]);
    
    return html`<${Shell} on="learn">
        <div class="rowb mb-4">
            <h2 class="text-pri">${m.name} <span class="mute" style=${{fontSize: '1.2rem'}}>— Langkah ${s.i+1}/${n}</span></h2>
            <div class="pill ${speaking ? 'v' : 'd'}">${speaking ? "Instruktur Bersuara..." : "Menunggu..."}</div>
            <div class="seg sp" style=${{maxWidth: 300}}>${m.steps.map((_, i) => html`<i key=${i} class=${i<=s.i?"on":""}/>`)}</div>
        </div>
        
        <div class="card glass c" style=${{padding: '60px 20px'}}>
            <div class="item-icon" style=${{width: 160, height: 160, fontSize: 70, borderRadius: '50%'}} onClick=${()=>speak(x[1]+". "+x[2])}>${x[0]}</div>
            <h1 style=${{fontSize: '3.5rem', color: '#311B92'}}>${hide ? "Coba sendiri ya!" : x[1]}</h1>
            ${det && html`<p class="mute" style=${{fontSize: '1.5rem', maxWidth: 600, margin: '20px auto 0'}}>${x[2]}</p>`}
        </div>
        
        <${MicBar}/>
        
        <div class="four">
            <${Btn} c="w" onClick=${()=>run("bantuan","tombol")}>Butuh Bantuan?<//>
            <${Btn} c="o" onClick=${()=>run("ulangi","tombol")}>Ulangi Suara<//>
            <${Btn} c="g" onClick=${()=>run("lanjut","tombol")} style=${{gridColumn: 'span 2'}}>${s.i===n-1 ? "Selesai Modul" : "Langkah Selanjutnya"}<//>
        </div>
    <//>`;
}

export function Voice() {
    const {last, setLast, sess, go, run, toast, listening, mic} = useX();
    const l = last;
    return html`<${Shell} on="voice">
        <div class="c">
            <span class="pill v mb-4">${sess ? "Modul "+M(sess.mod).name+" • Langkah "+(sess.i+1) : "Uji mikrofon"}</span>
            <div style=${{margin:"40px 0"}}>
                <${Mascot} size=${200}/>
            </div>
            <h1 style=${{fontSize: '3rem'}}>Saya Mendengarkan...</h1>
            <p class="mute" style=${{fontSize: '1.3rem'}}>Katakan perintahmu dengan santai: lanjut, ulangi, bantuan, atau selesai.</p>
            ${l ? html`<div class="glass card" style=${{maxWidth:480, margin:"32px auto"}}>
                <span class="pill v mb-4">PERINTAH TERDETEKSI</span>
                <h2 class="text-pri" style=${{fontSize: '3rem', margin:"8px 0"}}>"${l[0].toUpperCase()+l.slice(1)}"</h2>
                <div class="row mt-4" style=${{justifyContent:"center"}}>
                    <${Btn} onClick=${()=>{setLast(null); if(sess){go("learn"); run(l,"suara");}else{toast("Mikrofon berfungsi dengan baik");}}}>Ya, Benar!<//>
                    <${Btn} c="w" onClick=${()=>setLast(null)}>Bukan, Ulangi<//>
                </div>
            </div>` : null}
        </div>
    <//>`;
}

export function Done() {
    const {cfg, hist, cur, go, startLearn, setMod, speak, setRec, setSess} = useX();
    const h = hist.find(x => x.id === cur);
    if (!h) return null;
    
    const tot = starsToday(hist);
    const p = Math.round((tot/10)*100) || 0;
    const msg = "Hebat! Kamu telah menyelesaikan modul ini dengan baik.";
    
    useEffect(() => { speak("Hebat, "+cfg.child+"! "+msg); }, [cur]);
    
    return html`<${Shell} on="home">
        <div class="hero-banner" style=${{flexDirection: 'column', textAlign: 'center'}}>
            <div style=${{fontSize: '80px', marginBottom: 20}}>🏆</div>
            <h1 style=${{fontSize: '4rem'}}>Luar Biasa, ${cfg.child}!</h1>
            <p style=${{fontSize: '1.5rem'}}>Kamu telah mendapatkan pengalaman baru hari ini.</p>
        </div>
        
        <div class="grid">
            <div class="glass card c">
                <h3 class="text-pri mb-4">Total Bintang Hari Ini</h3>
                <div style=${{display: 'flex', justifyContent: 'center'}}><${ProgressCircle} percent=${p} label="Bintang" /></div>
            </div>
            <div class="glass card">
                <h3 class="text-pri mb-4">Catatan Pendamping</h3>
                ${h.obs ? html`<p class="mute" style=${{fontSize: '1.2rem'}}>Tugas sudah dicatat. Terima kasih!</p>` : html`
                    <p class="mute mb-4" style=${{fontSize: '1.2rem'}}>Pendamping, silakan catat hasil latihan anak untuk memperbarui progress capaian.</p>
                    <${Btn} onClick=${()=>setRec(h)} style=${{width: '100%'}}>Isi Catatan Latihan<//>
                `}
            </div>
        </div>
        <div class="row mt-4" style=${{justifyContent: 'center'}}>
            <${Btn} c="w big" onClick=${()=>{setSess(null); go("home");}}>Kembali ke Menu<//>
            <${Btn} c="g big" onClick=${()=>{setMod(h.mod); startLearn(h.mod);}}>Main Lagi<//>
        </div>
    <//>`;
}

export function RecForm() {
    const {rec:h, setRec, hist, setHist, notes, setNotes, cfg} = useX();
    const [o, setO] = useState(h.steps.map(() => "d"));
    const [t, setT] = useState("");
    
    const save = () => {
        setHist(hs => hs.map(e => e.id === h.id ? {...e, obs:o, note:t.trim()} : e));
        if (t.trim()) setNotes([...notes, {who:"Guru", name:cfg.teacher, text:t.trim(), t:Date.now()}]);
        setRec(null);
    };
    
    return html`<div class="overlay" onClick=${e => e.target === e.currentTarget && setRec(null)}>
        <div class="popup" style=${{textAlign: 'left', maxWidth: 600}}>
            <h2 class="text-pri mb-4">Catatan Pengamatan</h2>
            ${h.steps.map((s, i) => html`<div key=${i} style=${{padding:"16px 0", borderBottom:"1px solid #EDE7F6"}}>
                <div class="rowb mb-4"><b>${i+1}. ${s}</b> <span class="pill d">bantuan ${h.helps[i]}x</span></div>
                <div class="row">${OB.map(a => html`<button key=${a[0]} class=${"btn sm "+(o[i]===a[0]?"":"w")} onClick=${()=>setO(o.map((v, j) => j===i?a[0]:v))}>${a[1]}</button>`)}</div>
            </div>`)}
            <div class="mt-4">
                <label>Catatan Tambahan (Buku Penghubung)</label>
                <textarea rows="3" value=${t} onInput=${e => setT(e.target.value)} placeholder="Tulis perkembangan anak saat ini..."/>
            </div>
            <div class="row mt-4">
                <${Btn} onClick=${save} style=${{flex: 1}}>Simpan Catatan<//>
                <${Btn} c="w" onClick=${()=>setRec(null)}>Batal<//>
            </div>
        </div>
    </div>`;
}
