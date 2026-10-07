export const { useState, useEffect, useRef, createContext, useContext, useMemo } = React;
export const html = htm.bind((t, p, ...c) => {
    if (p && p.class) { p = { ...p, className: p.class }; delete p.class; }
    return React.createElement(t, p, ...c);
});

export const MODS = [
    {
        id: "cuci", name: "Cuci Tangan",
        tools: [
            ["SB", "Sabun", "Membuat tangan wangi dan bersih."],
            ["AR", "Air", "Untuk membasahi dan membilas tangan."],
            ["LP", "Lap", "Untuk mengeringkan tangan."]
        ],
        steps: [
            ["1", "Basahi tangan", "Buka keran air. Basahi kedua tangan."],
            ["2", "Pakai sabun", "Ambil sabun. Ratakan di kedua tangan."],
            ["3", "Gosok tangan", "Gosok telapak, punggung tangan, dan sela jari."],
            ["4", "Bilas", "Bilas tangan sampai bersih."],
            ["5", "Keringkan", "Keringkan tangan dengan lap bersih."]
        ]
    },
    {
        id: "kaus", name: "Memakai Kaus",
        tools: [
            ["KS", "Kaus", "Kaus punya bagian depan dan belakang."],
            ["KP", "Lubang kepala", "Lubang besar untuk kepala."],
            ["LN", "Lubang lengan", "Dua lubang untuk tangan."]
        ],
        steps: [
            ["1", "Ambil kaus", "Ambil kaus. Lihat bagian depan dan belakang."],
            ["2", "Masukkan kepala", "Masukkan kepala lewat lubang besar."],
            ["3", "Satu tangan", "Masukkan satu tangan ke lubang lengan."],
            ["4", "Tangan lainnya", "Masukkan tangan yang lain."],
            ["5", "Rapikan", "Tarik kaus ke bawah sampai rapi."]
        ]
    },
    {
        id: "makan", name: "Makan dan Minum",
        tools: [
            ["PR", "Piring", "Tempat makanan."],
            ["SD", "Sendok", "Untuk menyuap makanan."],
            ["GL", "Gelas", "Tempat air minum."]
        ],
        steps: [
            ["1", "Siapkan alat", "Siapkan piring, sendok, dan gelas."],
            ["2", "Ambil makanan", "Ambil makanan secukupnya."],
            ["3", "Makan", "Makan pelan-pelan dengan sendok."],
            ["4", "Minum", "Minum air dari gelas."],
            ["5", "Rapikan", "Bawa piring dan gelas ke tempat cuci."]
        ]
    }
];

export const LV = [["penuh", "Panduan lengkap"], ["ringkas", "Petunjuk ringkas"], ["mandiri", "Coba mandiri"]];
export const OB = [["m", "Mandiri"], ["d", "Dibantu"], ["b", "Belum bisa"]];
export const CMD = { 
    lanjut: /\b(lanjut|lanjutkan|berikutnya|next)\b/, 
    ulangi: /\b(ulangi|ulang)\b/, 
    bantuan: /\b(bantuan|bantu|tolong)\b/, 
    selesai: /\b(selesai|sudah|udah)\b/ 
};

export const CH = {
    kak: { n: "Kak Bisa", d: "Ceria dan penuh semangat", pitch: 1.45, rate: .92 },
    bu: { n: "Bu Guru", d: "Lembut dan sabar", pitch: 1.15, rate: .82 },
    pak: { n: "Pak Guru", d: "Tenang dan hangat", pitch: .7, rate: .86 },
    pel: { n: "Kak Pelangi", d: "Riang seperti bernyanyi", pitch: 1.8, rate: 1 }
};

export const TONES = {
    semangat: ["Semangat", (n, x) => `Ayo ${n}, ${x[1].toLowerCase()}! ${x[2]} Kamu pasti bisa!`],
    lembut: ["Lembut", (n, x) => `${n}, pelan-pelan saja ya. ${x[1]}. ${x[2]} Tidak apa-apa kalau butuh waktu.`],
    singkat: ["Singkat", (n, x) => `${x[1]}. ${x[2]}`]
};

export const DC = { child: "Rian", parent: "Bunda Dewi", teacher: "Bu Rahmawati", level: "penuh" };
export const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

const mem = {};
export const ld = (k, d) => {
    try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
    } catch (e) {
        return k in mem ? mem[k] : d;
    }
};

export const sv = (k, v) => {
    mem[k] = v;
    try {
        localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
};

export function useSt(k, d) {
    const [v, s] = useState(() => ld(k, d));
    return [v, x => s(p => { const n = typeof x === "function" ? x(p) : x; sv(k, n); return n; })];
}

export const M = id => MODS.find(m => m.id === id);
export const today = t => new Date(t).toDateString() === new Date().toDateString();
export const fmt = t => new Date(t).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const stars = h => h.obs ? h.obs.filter(o => o === "m").length : 0;
export const score = h => h.obs ? h.obs.reduce((a, o) => a + (o === "m" ? 1 : o === "d" ? .5 : 0), 0) / h.obs.length : null;
export const starsToday = hs => Math.min(10, hs.filter(x => today(x.id)).reduce((a, x) => a + stars(x), 0));

export const X = createContext();
export const useX = () => useContext(X);

export function useVoices() {
    const [v, s] = useState([]);
    useEffect(() => {
        const f = () => { try { s(speechSynthesis.getVoices()); } catch(e) {} };
        f();
        try { speechSynthesis.addEventListener("voiceschanged", f); } catch(e) {}
        return () => { try { speechSynthesis.removeEventListener("voiceschanged", f); } catch(e) {} };
    }, []);
    return v;
}
