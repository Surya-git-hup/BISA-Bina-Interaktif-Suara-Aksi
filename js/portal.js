import { html, useState, useX, M, MODS, today, fmt, score, starsToday, LV, OB } from './utils.js';
import { Btn, ProgressCircle } from './components.js';

export function Portal() {
    const x = useX();
    const {role, page, setPage, go} = x;
    const g = role === "guru";
    const pages = [["dash", "Dashboard"], ...(g ? [["siswa", "Data Siswa"]] : []), ["akt", "Aktivitas"], ["buku", "Buku Penghubung"], ["set", "Pengaturan"]];
    const P = {dash:g?PGuru:POrtu, siswa:PGuru, detail:PDetail, akt:PAkt, buku:PBuku, set:PSet}[page];
    
    return html`<div class="pt">
        <aside class="sb glass">
            <div class="logo mb-4">BISA<div class="sm mute" style=${{fontWeight:600}}>Portal ${g ? "Guru" : "Orang Tua"}</div></div>
            ${pages.map(p => html`<button key=${p[0]} class=${"n "+(page===p[0]||(page==="detail"&&p[0]==="siswa")?"on":"")} onClick=${()=>setPage(p[0])}>${p[1]}</button>`)}
            <div class="sp"/>
            <${Btn} c="w" style=${{width: '100%', justifyContent: 'flex-start'}} onClick=${()=>go("login")}>Keluar Portal<//>
        </aside>
        <div class="pg" key=${page}><${P}/></div>
    </div>`;
}

function PGuru() {
    const {cfg, hist, setPage} = useX();
    const l = hist.find(x => x.obs);
    const sc = l ? score(l) : null;
    const percent = sc === null ? 0 : Math.round(sc*100);
    
    return html`<div class="hero-banner" style=${{padding: 32, marginBottom: 24, borderRadius: 32}}>
            <div class="hero-text">
                <h1 style=${{fontSize: '2.5rem'}}>Dashboard Guru</h1>
                <p style=${{margin:0}}>Pantau perkembangan siswa binaan Anda.</p>
            </div>
        </div>
        <div class="glass card" style=${{cursor:"pointer", display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap'}} onClick=${()=>setPage("detail")}>
            <${ProgressCircle} percent=${percent} label="Capaian" />
            <div class="sp">
                <h2 class="text-pri">${cfg.child}</h2>
                <p class="mute mb-4">Modul Terakhir: <b>${l ? l.name : "Belum latihan"}</b></p>
                <span class="pill v">Tingkat Scaffolding: ${cfg.level.toUpperCase()}</span>
            </div>
            <${Btn} c="w">Lihat Detail →<//>
        </div>`;
}

function PDetail() {
    const {cfg, setCfg, hist, notes, setPage} = useX();
    const h = hist[0];
    const nt = notes.filter(n => n.who === "Guru").pop();
    
    return html`<button class="btn w sm mb-4" onClick=${()=>setPage("siswa")}>← Kembali ke Data Siswa</button>
        <div class="glass card">
            <h2 class="text-pri mb-4">Profil Belajar: ${cfg.child}</h2>
            <div class="rowb">
                <div>
                    <label>Ubah Tingkat Bantuan</label>
                    <div class="rs mt-4">${LV.map(l => html`<button key=${l[0]} class=${cfg.level===l[0]?"on":""} onClick=${()=>setCfg({...cfg, level:l[0]})}>${l[1]}</button>`)}</div>
                </div>
                <${Btn} c="o" onClick=${()=>setPage("buku")}>Buka Buku Penghubung<//>
            </div>
        </div>
        <div class="grid">
            <div class="glass card c">
                <h3 class="text-pri mb-4">Sesi Dicatat</h3>
                <h1 style=${{fontSize: '4rem'}}>${hist.filter(x => x.obs).length}</h1>
                <p class="mute">Dari total ${hist.length} sesi</p>
            </div>
            <div class="glass card c">
                <h3 class="text-pri mb-4">Aktivitas Terakhir</h3>
                <h2 style=${{fontSize: '2rem'}}>${h ? h.name : "-"}</h2>
                <p class="mute">${h ? "bantuan diminta "+h.help+"x" : ""}</p>
            </div>
        </div>
        <div class="glass card">
            <h3 class="text-pri mb-4">Catatan Guru Terkini</h3>
            <p style=${{fontStyle:"italic", fontSize: '1.2rem'}}>${nt ? "“"+nt.text+"”" : "Belum ada catatan."}</p>
        </div>`;
}

function POrtu() {
    const {cfg, hist, setPage} = useX();
    const ts = hist.filter(x => today(x.id));
    const percent = Math.round((starsToday(hist)/10)*100) || 0;
    
    return html`<div class="hero-banner" style=${{padding: 32, marginBottom: 24, borderRadius: 32}}>
            <div class="hero-text">
                <h1 style=${{fontSize: '2.5rem'}}>Halo, ${cfg.parent}!</h1>
                <p style=${{margin:0}}>Ayo pantau kemandirian ${cfg.child} hari ini.</p>
            </div>
        </div>
        <div class="grid">
            <div class="glass card c">
                <h3 class="text-pri mb-4">Target Bintang Harian</h3>
                <div style=${{display: 'flex', justifyContent: 'center'}}><${ProgressCircle} percent=${percent} label="Aktivitas" /></div>
            </div>
            <div class="glass card">
                <h3 class="text-pri mb-4">Aktivitas Hari Ini</h3>
                ${ts.length ? ts.map(x => html`<div key=${x.id} class="rowb mb-4" style=${{borderBottom: '1px solid #EDE7F6', paddingBottom: 8}}><b style=${{fontSize: '1.2rem'}}>${x.name}</b> <span class=${"pill "+(x.obs?"v":"d")}>${x.obs?"Tuntas":"Belum Dicatat"}</span></div>`) : html`<p class="mute">Belum ada latihan hari ini.</p>`}
                <${Btn} c="w" style=${{width: '100%', marginTop: 16}} onClick=${()=>setPage("akt")}>Lihat Semua Riwayat<//>
            </div>
        </div>`;
}

function PAkt() {
    const {hist, setRec} = useX();
    return html`<h2 class="text-pri mb-4">Riwayat Aktivitas</h2>
        ${hist.length ? hist.map(h => html`<div key=${h.id} class="glass card">
            <div class="rowb mb-4"><h3 class="text-pri" style=${{margin:0}}>${h.name}</h3><span class="sm mute">${fmt(h.id)}</span></div>
            <p class="sm mute mb-4">Durasi: ${h.dur}s | Bantuan diminta: ${h.help}x</p>
            <div>${h.obs ? h.obs.map((o, i) => html`<span key=${i} class=${"pill "+o} style=${{margin:2}}>${i+1}. ${h.steps[i]}: ${OB.find(a=>a[0]===o)[1]}</span>`) : html`<span class="pill d mb-4">Belum dicatat pendamping</span> <br/><${Btn} c="w sm" onClick=${()=>setRec(h)}>Isi Catatan Latihan<//>`}</div>
        </div>`) : html`<div class="glass card mute">Belum ada sesi latihan.</div>`}`;
}

function PBuku() {
    const {notes, setNotes, cfg, role} = useX();
    const [t, setT] = useState("");
    const g = role === "guru";
    const send = () => { if (!t.trim()) return; setNotes([...notes, {who: g ? "Guru" : "Orang Tua", name: g ? cfg.teacher : cfg.parent, text: t.trim(), t: Date.now()}]); setT(""); };
    
    return html`<h2 class="text-pri mb-4">Buku Penghubung</h2>
        <div class="glass card row">
            <input type="text" value=${t} onInput=${e => setT(e.target.value)} placeholder="Tulis pesan atau kabar anak hari ini..." style=${{flex:1}}/>
            <${Btn} onClick=${send}>Kirim<//>
        </div>
        ${notes.slice().reverse().map((x, i) => html`<div key=${i} class="glass card" style=${{borderLeft: `6px solid ${x.who==='Guru'?'#00E676':'#FFB300'}`}}>
            <div class="rowb mb-4">
                <span><span class=${"pill "+(x.who==="Guru"?"v":"d")}>${x.who}</span> <b style=${{marginLeft: 8}}>${x.name}</b></span>
                <span class="sm mute">${fmt(x.t)}</span>
            </div>
            <p style=${{margin:0, fontSize: '1.1rem'}}>${x.text}</p>
        </div>`)}`;
}

function PSet() {
    const {cfg, setCfg, setHist, setNotes, toast} = useX();
    const [f, setF] = useState(cfg);
    const u = k => e => setF({...f, [k]: e.target.value});
    
    return html`<h2 class="text-pri mb-4">Pengaturan Profil</h2>
        <div class="glass card">
            <label>Nama Panggilan Siswa</label><input type="text" value=${f.child} onInput=${u("child")}/>
            <label>Nama Orang Tua</label><input type="text" value=${f.parent} onInput=${u("parent")}/>
            <label>Nama Guru SLB</label><input type="text" value=${f.teacher} onInput=${u("teacher")}/>
            <div class="row mt-4">
                <${Btn} onClick=${()=>{setCfg({...cfg, ...f}); toast("Tersimpan!");}}>Simpan Perubahan<//>
                <${Btn} c="r" onClick=${()=>{if(confirm("Yakin hapus riwayat latihan?")){setHist([]); setNotes([]); toast("Dihapus");}}}>Reset Riwayat<//>
            </div>
        </div>`;
}
