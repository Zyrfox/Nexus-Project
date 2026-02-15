import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    if (!genAI) {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('GEMINI_API_KEY is not configured in .env');
        }
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return genAI;
}

// The Nexus "Nyelekit" System Prompt
const NEXUS_SYSTEM_PROMPT = `Kamu adalah NEXUS, AI Coach yang brutal, jujur, dan "nyelekit" tapi punya tujuan baik.
Kamu sedang memantau seorang Muslim yang ingin memaksimalkan Ramadan-nya.

RULES:
1. Kamu TIDAK BOLEH lembek. Kalau user gagal, roasting dia dengan analogi teknologi/bisnis/startup.
2. Gunakan bahasa campuran Indonesia-English (Jaksel style) yang tajam.
3. Setiap feedback HARUS diakhiri dengan ACTION ITEM yang konkret dan bisa dilakukan.
4. Kalau user konsisten bagus, puji dengan singkat lalu tantang lebih tinggi.
5. Referensikan data spesifik user (halaman dibaca, PnL, leak yang terjadi).
6. Kalau ada "leak" (main game/nonton/baca komik), anggap itu pengkhianatan terhadap komitmen.
7. Untuk trading loss, gunakan analogi risk management dan equity drawdown.
8. Response maksimal 3 paragraf. Singkat, tajam, nusuk.`;

export type NexusContext = {
    logDate: string;
    // Spiritual
    sholatFardhu: number;
    pagesRead: number;
    cumulativePages: number;
    targetPages: number;
    // Discipline
    leakGames: boolean;
    leakMovies: boolean;
    leakComicsNovel: boolean;
    // Financial
    tradingPnl: number;
    cumulativeCapital: number;
    tradingRiskLimitPercent: number;
    zakatTarget: number;
    // Meta
    auditMode: 'LEAK' | 'FINANCIAL_RISK' | 'NORMAL';
    leakDetails?: string;
};

export async function generateNexusFeedback(context: NexusContext): Promise<{
    message: string;
    actionItem: string;
}> {
    try {
        const client = getClient();
        const model = client.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: NEXUS_SYSTEM_PROMPT,
        });

        const progressPercent = context.targetPages > 0
            ? ((context.cumulativePages / context.targetPages) * 100).toFixed(1)
            : '0';

        const zakatPercent = context.zakatTarget > 0
            ? ((context.cumulativeCapital / Number(context.zakatTarget)) * 100).toFixed(1)
            : 'N/A';

        const prompt = `
DATA HARI INI (${context.logDate}):
- Sholat Fardhu: ${context.sholatFardhu}/5
- Halaman Quran dibaca: ${context.pagesRead} (Kumulatif: ${context.cumulativePages}/${context.targetPages} = ${progressPercent}%)
- Leak Games: ${context.leakGames ? 'YA ❌' : 'Tidak ✅'}
- Leak Movies: ${context.leakMovies ? 'YA ❌' : 'Tidak ✅'}
- Leak Comics/Novel: ${context.leakComicsNovel ? 'YA ❌' : 'Tidak ✅'}
- Trading PnL Hari Ini: Rp ${context.tradingPnl.toLocaleString()}
- Capital Kumulatif: Rp ${context.cumulativeCapital.toLocaleString()} (Target Zakat: ${zakatPercent}%)
- Risk Limit: ${context.tradingRiskLimitPercent}%

MODE: ${context.auditMode}
${context.leakDetails ? `DETAIL LEAK: ${context.leakDetails}` : ''}

Berikan feedback NEXUS untuk hari ini. Format response HARUS:
FEEDBACK: [pesan nyelekit 2-3 paragraf]
ACTION: [satu kalimat action item konkret untuk besok]`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse response
        const feedbackMatch = responseText.match(/FEEDBACK:\s*([\s\S]*?)(?=ACTION:|$)/i);
        const actionMatch = responseText.match(/ACTION:\s*([\s\S]*?)$/i);

        return {
            message: feedbackMatch?.[1]?.trim() || responseText.trim(),
            actionItem: actionMatch?.[1]?.trim() || 'Review performa hari ini dan buat target untuk besok.',
        };
    } catch (error) {
        console.error('Gemini API Error:', error);
        // Fallback to static messages if Gemini fails
        return getFallbackMessage(context);
    }
}

function getFallbackMessage(context: NexusContext): { message: string; actionItem: string } {
    if (context.auditMode === 'LEAK') {
        return {
            message: 'LEAK DETECTED. Lo janji mau berubah, tapi masih nge-waste waktu. Ramadan bukan waktu buat main-main. Setiap detik yang lo buang, itu equity akhirat lo yang terbakar.',
            actionItem: 'Hapus semua trigger app. Puasa digital 24 jam mulai sekarang.',
        };
    }
    if (context.auditMode === 'FINANCIAL_RISK') {
        return {
            message: 'STOP TRADING. Risk management lo jebol. Equity drawdown udah melewati batas. Kalau lo trader beneran, lo tau kapan harus cut. Ini saatnya.',
            actionItem: 'Stop trading 3 hari. Review journal. Jangan buka chart sampai mental stabil.',
        };
    }
    return {
        message: `Hari ini clean. Tapi jangan GR. Progress Quran lo baru ${context.cumulativePages}/${context.targetPages}. Masih jauh dari khatam.`,
        actionItem: 'Tambah 5 halaman dari target harian besok.',
    };
}
