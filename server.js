const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Statik HTML arayüzünü sunmak için public klasörünü aktif et
app.use(express.static(path.join(__dirname, 'public')));

// Bağıl URL'leri tam URL'ye çeviren yardımcı fonksiyon
function rel2abs(rel, base) {
    try {
        return new URL(rel, base).href;
    } catch (e) {
        return rel;
    }
}

// 🎬 Ana Playlist (.m3u8) Proxy Rotası
app.get('/play/:id/index.m3u8', async (req, res) => {
    const { id } = req.params;
    const targetUrl = `https://kool.to/play/${id}/index.m3u8`;
    const myHost = `${req.protocol}://${req.get('host')}`;

    try {
        const response = await axios.get(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
                'Referer': 'https://kool.to/'
            },
            maxRedirects: 5,
            timeout: 12000
        });

        // 302 sonrası ulaşılan gizli ana sunucu adresi
        const effectiveUrl = response.request.res.responseUrl || targetUrl;
        let m3u8Content = response.data;

        if (typeof m3u8Content !== 'string') {
            m3u8Content = m3u8Content.toString();
        }

        const lines = m3u8Content.split('\n');
        const rewrittenLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return line;

            if (!trimmed.startsWith('#')) {
                // Video parçalarını (.ts) bizim sunucu üzerinden tünelle
                const absUrl = rel2abs(trimmed, effectiveUrl);
                return `${myHost}/ts?url=${encodeURIComponent(absUrl)}`;
            } else {
                // Eğer içeride AES-128 Şifre çözme anahtarı (Key) varsa onu da tünelle
                if (trimmed.includes('URI=')) {
                    return trimmed.replace(/URI=["']([^"']+)["']/, (match, p1) => {
                        const absUrl = rel2abs(p1, effectiveUrl);
                        return `URI="${myHost}/ts?url=${encodeURIComponent(absUrl)}"`;
                    });
                }
                return line;
            }
        });

        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(rewrittenLines.join('\n'));

    } catch (error) {
        res.status(500).send('M3U8 Proxy Hatası: ' + error.message);
    }
});

// 🔀 Video Parçacıkları (.ts) ve Key Dağıtım Rotası
app.get('/ts', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL parametresi eksik.');

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
                'Referer': 'https://kool.to/'
            },
            timeout: 15000
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'video/MP2T');
        res.setHeader('Access-Control-Allow-Origin', '*');
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('TS Akış Hatası: ' + error.message);
    }
});

app.listen(PORT, () => console.log(`Proxy sunucusu ${PORT} portunda aktif!`));