import { html, useX, SR, useState, useEffect } from './utils.js';

export const Btn = ({c="", ...p}) => html`<button ...${p} class=${"btn "+c}/>`;

export function Mascot({size=160, onClick}) {
    const {speaking} = useX();
    return html`
    <div class=${"cute-mascot" + (speaking ? " talk" : "")} style=${{width: size, height: size}} onClick=${onClick}>
        <div class="eyes"><div class="eye"></div><div class="eye"></div></div>
        <div class="mouth"></div>
    </div>`;
}

export function Shell({on, children}) {
    const x = useX();
    const {cfg, go, startLearn, sess, view, role} = x;
    const nav = n => {
        if (n==="learn") return sess && view!=="done" ? go("learn") : startLearn();
        if (n==="voice") return go("voice");
        go("home");
    };
    return html`
    <div class="nav-wrap">
        <header class="top-nav">
            <div class="logo">BISA</div>
            ${role === 'siswa' ? html`
            <nav class="nav-links sp" style=${{justifyContent: 'center'}}>
                ${[["home","Beranda"],["learn","Latihan"],["voice","Suara"]].map(p => html`<button key=${p[0]} class=${on===p[0]?"on":""} onClick=${()=>nav(p[0])}>${p[1]}</button>`)}
            </nav>
            ` : html`<div class="sp"></div>`}
            <div style=${{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <b style=${{color: 'var(--text-main)'}}>Halo, ${role==='siswa' ? cfg.child : role==='guru' ? cfg.teacher : cfg.parent}!</b>
                <${Btn} c="w sm" onClick=${()=>go("login")}>Ganti Akun<//>
            </div>
        </header>
    </div>
    <main class="pg" key=${view}>${children}</main>`;
}

export function MicBar() {
    const {listening, mic} = useX();
    const on = listening && mic;
    return html`<div class=${"mic-status" + (on?" live":"")}>
        <div class="mic-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>
        </div>
        <div class="sp">
            ${on ? html`<b class="text-pri">Sedang mendengarkan...</b><div class="sm mute">Katakan "Lanjut", "Ulangi", atau "Bantuan"</div>` : html`<b>Mikrofon Mati</b><div class="sm mute">${SR?"Klik 'Izinkan' di browser.":"Gunakan tombol kendali di bawah."}</div>`}
        </div>
        <div class="waves"><i/><i/><i/><i/><i/></div>
    </div>`;
}

export function MicPermission({ onAllow }) {
    const [asking, setAsking] = useState(false);
    const requestMic = () => {
        setAsking(true);
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => { onAllow(true); })
            .catch(() => { setAsking(false); onAllow(false); });
    };

    return html`
    <div class="overlay">
        <div class="popup">
            <div style=${{fontSize: 64, marginBottom: 20}}>🎙️</div>
            <h2 class="text-pri mb-4">BISA Butuh Suaramu!</h2>
            <p class="mute mb-4" style=${{fontSize: '1.2rem'}}>Agar kamu bisa memberi perintah suara tanpa menyentuh layar, izinkan BISA menggunakan mikrofon ya.</p>
            <div class="row" style=${{justifyContent: 'center'}}>
                <${Btn} onClick=${requestMic}>${asking ? "Menunggu Izin..." : "Izinkan Mikrofon"}<//>
                <${Btn} c="w" onClick=${()=>onAllow(false)}>Lain Kali Saja<//>
            </div>
        </div>
    </div>`;
}

export function ProgressCircle({ percent, label }) {
    return html`
    <div class="circle-prog" style=${{"--p": percent}}>
        <div class="circle-prog-val">${percent}%<span>${label}</span></div>
    </div>`;
}
