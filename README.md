# M3U TV — Android TV için M3U / IPTV oynatıcı

Kendi M3U / M3U8 oynatma listenizi (adres olarak) yükleyip Android TV'de uzaktan kumandayla izlemenizi sağlayan sade bir uygulama.
**Uygulamayla birlikte hiçbir kanal ya da liste gelmez**; yalnızca izleme hakkına sahip olduğunuz listeleri kullanın.

## Özellikler
- Android TV launcher'ında görünür (banner + LEANBACK_LAUNCHER), kumandayla (D-pad) tam kullanım
- M3U/M3U8 listesi: `tvg-id`, `tvg-logo`, `group-title`, `#EXTGRP`, `#EXTVLCOPT` (user-agent / referrer) desteği
- Gruplara göre gezinme, kanal arama, kanal logoları
- Favoriler (kanal üzerinde OK tuşuna basılı tut)
- Listeyi telefondan gönderme: "Liste ekle" penceresi açıkken, aynı Wi‑Fi'deki telefonun tarayıcısında ekrandaki adresi açıp liste adresini yapıştırırsınız
- Media3 / ExoPlayer ile HLS (.m3u8), MPEG‑TS ve diğer yaygın akışlar; hata olunca otomatik yeniden deneme
- Liste önbelleğe alınır, açılışta anında yüklenir; "Yenile" ile yeniden indirilir

## Kumanda tuşları (oynatıcı)
| Tuş | İşlev |
|---|---|
| ↑ / CH+ | Sonraki kanal |
| ↓ / CH− | Önceki kanal |
| OK | Kanal bilgisini göster / gizle |
| Oynat/Duraklat | Duraklat / devam |
| Geri | Listeye dön |

## APK'yı derleme

### Yol 1 — Android Studio (en kolayı)
1. Android Studio'yu (güncel sürüm) kurun, **Open** ile bu klasörü açın; Gradle eşitlemesi (sync) bitsin.
2. **Build ▸ Build Bundle(s) / APK(s) ▸ Build APK(s)**
3. APK: `app/build/outputs/apk/debug/app-debug.apk`

### Yol 2 — Bilgisayara bir şey kurmadan (GitHub Actions)
1. Bu klasörü yeni bir GitHub deposuna yükleyin.
2. **Actions ▸ Build APK ▸ Run workflow**
3. İş bitince **Artifacts** altından `M3UTV-debug-apk` dosyasını indirin.

## TV'ye kurma
- **ADB:** TV'de Geliştirici seçenekleri ▸ USB/ağ hata ayıklamayı açın, sonra:
  `adb connect TV_IP_ADRESI` ve `adb install app-debug.apk`
- **USB bellek / Downloader uygulaması:** APK'yı TV'ye taşıyıp "bilinmeyen kaynaklardan yüklemeye" izin verin.

## Notlar
- Paket adı `com.example.m3utv`; yayınlamayı düşünürseniz `app/build.gradle.kts` içindeki `namespace` ve `applicationId` ile `src/main/java/com/example/m3utv` klasörünü değiştirin.
- Birçok IPTV akışı `http://` olduğu için `usesCleartextTraffic` açıktır.
- Uygulama arayüzü Türkçedir; metinler `app/src/main/res/values/strings.xml` içinde.
- Gradle wrapper dosyası (`gradlew`) dahil değildir; Android Studio ya da GitHub Actions yolu bunu kendisi halleder.
