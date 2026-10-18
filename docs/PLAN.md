# Portfolyo Sitesi — Proje Planı

18 Ekim 2026 · Behlül Akdağ

## Özet ve hedefler

Tek sayfalık, elle yazılmış (HTML, CSS, JavaScript) kişisel bir site yapıyoruz. Aynı site iki kişiye hitap edecek: staj için bakan işverene "bu kişi yazılım geliştirebiliyor", freelance müşteriye "bu kişi benim işletmeme site yapabilir" dedirtecek.

**Hedefler:**

1. **Freelance vitrini:** Fiverr ve Upwork profillerine konacak link. Örnek işletme siteleriyle "ne yapabildiğimi" gösterecek.
2. **Staj vitrini:** CV'deki link. LiftLog, To-Do uygulaması ve Roblox oyunları tek yerde.
3. **HTML/CSS öğrenmek:** Teslim ettiğin sitelerde kodu kendin düzenleyebilmek için, bu siteyi baştan sona kendin yazacaksın. Site, yapabildiğinin kanıtı olacak.
4. **Akılda kalmak:** Sıradan bir şablon yerine birkaç havalı detayla (terminal girişi, 3D model, animasyonlar) hatırlanan bir site.

**Çalışma kuralı:** LiftLog'da olduğu gibi Claude Code adımı ve nedenini anlatır, kodu sen yazarsın. Hazır şablon veya site oluşturucu (Wix vb.) kullanılmaz.

**Alan adı önerisi:** `behlulakdag.dev` veya `behlul.dev` (müsaitlik ve fiyat o gün kontrol edilecek). Başlangıçta ücretsiz `kullaniciadi.github.io` adresi de yeterli.

## Sayfa yapısı

Site tek uzun bir sayfa; üstteki menüden bölümlere kayarak gidilir. Demo işletme siteleri ayrı sayfalarda açılır.

```
┌──────────────────────────────────────────────────────────────┐
│ Behlül Akdağ          Projeler · Hizmetler · İletişim · TR/EN · Tema │
├──────────────────────────────────────────────────────────────┤
│ GİRİŞ                                                        │
│  ┌──────────────────────────────┐  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ┐       │
│  │ > whoami                     │    3D model (Faz 4)        │
│  │ Behlül Akdağ · Yazılım gel.  │  │ sadece masaüstü  │       │
│  └──────────────────────────────┘  └ ─ ─ ─ ─ ─ ─ ─ ─ ┘       │
├──────────────────────────────────────────────────────────────┤
│ HAKKIMDA      Kısa tanıtım, fotoğraf, yetenek etiketleri     │
├──────────────────────────────────────────────────────────────┤
│ PROJELER   [Tümü] [Yazılım] [Oyun] [Web siteleri]            │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ LiftLog │ │ To-Do   │ │ Roblox oyun. │ │ Demo siteler │   │
│  └─────────┘ └─────────┘ └──────────────┘ └──────────────┘   │
├──────────────────────────────────────────────────────────────┤
│ HİZMETLER     3 hizmet kartı + "Teklif iste" butonu          │
├──────────────────────────────────────────────────────────────┤
│ GITHUB        Son güncellenen depolar (Faz 3)                │
├──────────────────────────────────────────────────────────────┤
│ İLETİŞİM      Formspree formu, e-posta, LinkedIn, GitHub     │
├──────────────────────────────────────────────────────────────┤
│ © 2026 · Fiverr · Upwork                                     │
└──────────────────────────────────────────────────────────────┘
```

En üstte terminal girişi dikkati çeker; hemen altında projeler gelir, çünkü hem işveren hem müşteri en çok oraya bakar.

## İçerik: projeler, hizmetler ve metinler

Sitede yedi proje kartı olacak: dört gerçek proje ve üç örnek işletme sitesi. Her kartın başlığı, kısa açıklaması, teknoloji etiketleri ve en az bir görseli olur.

| Proje | Kategori | Gösterilecek | Not |
| --- | --- | --- | --- |
| LiftLog | Mobil + backend | Ekran görüntüleri, GitHub linki | "Yapım aşamasında" etiketiyle; bitince güncellenir |
| Akıllı Planlayıcı (JavaFX + SQLite To-Do) | Masaüstü | Ekran görüntüsü, GitHub linki | Şimdilik kod kapaklı kart; gerçek ekran görüntüsü eklenecek |
| Garbage King (Roblox) | Oyun | Oyun görseli, Roblox + GitHub linki | ~107 bin satır Luau, 2.100+ commit |
| Smash for Eggs (Roblox) | Oyun | Oyun görseli, Roblox linki | Heavenly Forge Studios |
| Build a Chef (Roblox) | Oyun | Oyun görseli, Roblox linki | Heavenly Forge Studios |
| Örnek site: Kafe | Freelance demo | Canlı demo linki | Hayali marka, menü ve konum bölümü |
| Örnek site: Berber / kuaför | Freelance demo | Canlı demo linki | Hayali marka, randevu formu |
| Örnek site: Spor salonu | Freelance demo | Canlı demo linki | Hayali marka, üyelik paketleri |

**Örnek siteler hakkında:** Üçü de uydurma isimli, gerçek olmayan işletmeler olacak ve kartta "demo / örnek çalışma" diye yazılacak. Gerçek bir işletmenin adını veya logosunu kullanmak yasal sorun çıkarır; demo olduğunu açıkça yazmak da müşterinin güvenini artırır.

**Filtre:** Proje bölümünün üstünde "Tümü / Yazılım / Oyun / Web siteleri" butonları olur. Staj için bakan kişi yazılıma, müşteri web sitelerine tıklar.

**Hizmetler bölümü (freelance için):**

- Tek sayfalık tanıtım sitesi (landing page)
- Küçük işletme sitesi (3–5 sayfa)
- Mevcut sitenin yenilenmesi ve mobil uyumlu hale getirilmesi

Fiyat sitede yazılmaz; "teklif iste" butonu iletişim formuna götürür.

**Hakkımda metni:** Bilgisayar mühendisliği öğrencisi (İstanbul Aydın Üniversitesi), Java ve web geliştirme, oyun geliştirme, powerlifting. Metni sen yazarsın, Claude sadece düzeltme önerir.

**Dil:** Türkçe ve İngilizce (sağ üstte TR / EN düğmesi). Upwork müşterileri ve yabancı şirketler için İngilizce şart.

## Havalı özellikler

Sekiz özellik var; her biri hem siteyi akılda kalıcı yapıyor hem de sana yeni bir teknik öğretiyor. Zorluk sırasına göre fazlara dağıtıldı; ilk sürümde sadece kolay olanlar var.

| Özellik | Ne yapar | Öğrettiği | Zorluk | Faz |
| --- | --- | --- | --- | --- |
| Terminal girişi | Site açılınca siyah bir terminalde `> whoami` yazılır, ardından adın ve unvanın harf harf belirir | JavaScript zamanlayıcılar, DOM | Kolay | 2 |
| Karanlık / aydınlık tema | Sağ üstte ay-güneş düğmesi; seçim hatırlanır | CSS değişkenleri, localStorage | Kolay | 2 |
| Kaydırınca beliren bölümler | Bölümler ekrana girdikçe yumuşakça aşağıdan kayarak gelir | IntersectionObserver, CSS geçişleri | Kolay | 2 |
| Proje filtresi | Kategori butonlarına basınca kartlar animasyonla süzülür | Olay dinleyiciler, veri öznitelikleri | Orta | 2 |
| TR / EN dil düğmesi | Tüm metinler sayfa yenilenmeden değişir | JSON ile metin yönetimi | Orta | 3 |
| Canlı GitHub bölümü | Son güncellenen depoların ve dillerin GitHub'dan otomatik çekilmesi | `fetch` ve REST API (LiftLog'a hazırlık) | Orta | 3 |
| 3D model | Ana sayfada fareyle döndürülebilen, Blender'da senin yaptığın küçük bir model (örneğin bir halter) | Three.js, Blender'dan GLB dışa aktarma | Zor | 4 |
| Gizli komutlar | Terminale `help`, `projects`, `gym` gibi komutlar yazılabilir; gizli bir sürpriz (easter egg) | Metin işleme, durum yönetimi | Orta | 4 |

**Bilerek eklenmeyenler:** Ağır arka plan videoları, otomatik çalan müzik ve sürekli dönen yükleme ekranları. Bunlar siteyi yavaşlatır, telefonda pil yer ve müşteriyi kaçırır.

**Performans kuralı:** Havalı özellikler siteyi yavaşlatmamalı. Hedef: Lighthouse performans puanı 90 üstü. 3D model sadece masaüstünde yüklenir; telefonda yerine bir görsel gösterilir.

## Tasarım yönü

Görünüm: koyu zeminli, terminal havası olan, sade ve teknik bir site. Tek bir vurgu rengi kullanılır; süsleme yerine boşluk ve tipografi ön plandadır.

**Renkler (başlangıç önerisi, istediğin zaman değişir):**

| Rol | Koyu tema | Açık tema |
| --- | --- | --- |
| Arka plan | `#0e1116` | `#f7f7f5` |
| Kart / yüzey | `#161b22` | `#ffffff` |
| Ana metin | `#e6edf3` | `#1b1f24` |
| İkincil metin | `#8b949e` | `#57606a` |
| Vurgu (butonlar, linkler) | `#3fb950` terminal yeşili | `#1a7f37` |

**Yazı tipleri:** Başlıklar ve terminal için `JetBrains Mono`, metinler için `Inter`. İkisi de Google Fonts'ta ücretsiz.

**Kurallar:**

- Önce mobil: önce telefon ekranı tasarlanır, sonra geniş ekrana uyarlanır. Fiverr müşterilerinin çoğu telefondan bakar.
- Her renk ve boşluk değeri bir CSS değişkeninde durur (`--color-accent`, `--space-4` gibi). Tema değiştirmek sadece değişkenleri değiştirmek demek.
- Boşluklar 8'in katları (8, 16, 24, 32...) ile verilir.
- Hareketler kısa (0.2–0.4 sn) olur; işletim sisteminde "hareketi azalt" açık olan kullanıcılar için animasyonlar kapanır.
- Renk kontrastı okunabilirlik standardına (WCAG AA) uyar.

**İlham almak için:** Sevdiğin 3 portfolyo sitesini bul ve neyi beğendiğini not al. Tasarımı kopyalamak değil, fikir toplamak için.

## Teknoloji, barındırma ve klasör yapısı

Saf HTML, CSS ve JavaScript; framework yok. Amaç temeli öğrenmek: React gibi araçlar bu temelin üzerine kurulu, ve teslim ettiğin müşteri sitelerinin çoğu da düz HTML/CSS olacak.

| İhtiyaç | Araç | Neden |
| --- | --- | --- |
| Kod editörü | VS Code + Live Server eklentisi | Kaydedince tarayıcı kendiliğinden yenilenir |
| Sürüm kontrolü | Git + GitHub | Her adım kayıtlı, CV'de gösterilir |
| Barındırma | GitHub Pages | Ücretsiz, depoya push edince otomatik yayınlanır |
| İletişim formu | Formspree (ücretsiz plan) | Sunucu yazmadan form mesajını e-postana iletir |
| 3D (Faz 4) | Three.js (CDN'den) | Tarayıcıda 3D için en yaygın kütüphane |
| Hata ayıklama | Tarayıcı DevTools | Zaten çalıştığın konu |
| Test | Lighthouse (Chrome içinde) | Hız, erişilebilirlik ve SEO puanı |

**Örnek işletme siteleri** aynı depoda `demos/` klasöründe durur; ayrı adresleri olur (`.../demos/kafe/` gibi).

```
portfolio/
├── CLAUDE.md               # Claude Code talimatları
├── PROGRESS.md             # her oturum sonunda güncellenir
├── docs/PLAN.md            # bu plan
├── index.html              # ana sayfa
├── css/
│   ├── variables.css       # renkler, boşluklar, yazı tipleri
│   ├── base.css            # sıfırlama ve genel stiller
│   └── sections.css        # bölüm stilleri
├── js/
│   ├── terminal.js         # terminal girişi ve komutlar
│   ├── theme.js            # tema düğmesi
│   ├── filter.js           # proje filtresi
│   ├── i18n.js             # TR / EN
│   └── github.js           # canlı GitHub bölümü
├── lang/
│   ├── tr.json
│   └── en.json
├── assets/
│   ├── img/                # proje ekran görüntüleri (WebP)
│   ├── video/              # Roblox oynanış klipleri
│   └── models/             # 3D model (GLB)
└── demos/
    ├── kafe/
    ├── berber/
    └── spor-salonu/
```

## Yol haritası ve LiftLog ile birlikte çalışma düzeni

İlk sürüm 2 haftada yayında olur ve hemen Fiverr/Upwork'e eklenir; sonra her fazda biraz daha havalı hale gelir. Haftalar sıralı yazıldı, takvime bağlı değil; vize haftalarında durmak sorun değil.

**İki projeyi birlikte yürütmek:** LiftLog ve bu site aynı anda, üstelik vize döneminde ilerleyecek. Gerçekçi olmak gerekirse ikisi de yavaşlar. Önerilen düzen: **hafta içi 2 akşam portfolyo** (kısa oturumlar, HTML/CSS'e uygun), **hafta sonu LiftLog** (uzun oturum isteyen kurulum ve backend). Vize haftasında ikisi de durur.

**Faz 1 · İskelet ve ilk yayın (Hafta 1–2)**

- [x] GitHub'da `behlulakdag.github.io` deposu, GitHub Pages açık
- [x] `index.html`: Giriş, Hakkımda, Projeler, Hizmetler, İletişim bölümleri (sade HTML)
- [x] `variables.css` ile renkler ve yazı tipleri
- [x] Mobil uyumlu düzen (Flexbox ve Grid)
- [x] Proje kartları: LiftLog, To-Do, üç Roblox oyunu (Garbage King, Smash for Eggs, Build a Chef)
- [ ] Formspree ile çalışan iletişim formu (form hazır, Formspree form ID'si bekleniyor)
- [ ] Kapı: site canlıda, link Fiverr ve Upwork profillerinde

**Faz 2 · Havalı ilk dokunuşlar (Hafta 3–4)**

- [x] Terminal girişi animasyonu
- [x] Karanlık / aydınlık tema düğmesi
- [x] Kaydırınca beliren bölümler
- [x] Proje filtresi ("Web siteleri" düğmesi demo kartlar eklenince kendiliğinden çıkar)
- [ ] Roblox oynanış GIF'leri ve kart üzerine gelince oynayan video (oynanış kayıtları bekleniyor)

**Faz 3 · Demo siteler ve İngilizce (Hafta 5–8)**

- [ ] Demo site 1: Kafe
- [ ] Demo site 2: Berber / kuaför
- [ ] Demo site 3: Spor salonu
- [ ] TR / EN dil düğmesi
- [ ] Canlı GitHub bölümü
- [ ] Kapı: Fiverr gig'lerinde demo sitelerin ekran görüntüleri kullanılıyor

**Faz 4 · Şov kısmı (vizelerden sonra)**

- [ ] Blender'da küçük model, Three.js ile ana sayfada
- [ ] Terminal gizli komutları ve sürpriz
- [ ] Kendi alan adın (`.dev` gibi)
- [ ] LiftLog bitince kartını güncelle, APK linkini ekle

## Kalite kontrol ve yayın öncesi liste

Her faz bittiğinde bu liste kontrol edilir. Müşteri siteni açtığında bunlardan biri bozuksa, "site yaparım" demenin inandırıcılığı kalmaz.

- [ ] Telefonda (gerçek cihazda) açıldı, yatay kaydırma yok
- [ ] Lighthouse: Performans, Erişilebilirlik, En iyi uygulamalar ve SEO 90 üstü
- [ ] Tüm linkler çalışıyor, GitHub linkleri herkese açık depolara gidiyor
- [ ] İletişim formu test edildi, mesaj e-postana düştü
- [ ] Her görselin `alt` açıklaması var, görseller WebP ve sıkıştırılmış
- [ ] Sayfa başlığı, açıklaması ve paylaşım görseli (`og:image`) eklendi; link WhatsApp'ta güzel görünüyor
- [ ] Yazım hatası yok (Türkçe ve İngilizce)
- [ ] Chrome, Firefox ve telefonda Safari ya da Samsung tarayıcısında denendi
- [ ] Konsolda kırmızı hata yok

## İlk adım

İlk oturumun hedefi: sade bir `index.html` yazıp GitHub Pages'te canlıya almak. Daha tasarım yok, sadece "Merhaba, ben Behlül" yazan bir sayfa internette.

1. VS Code'a Live Server eklentisini kur
2. GitHub'da `portfolio` deposunu oluştur, bilgisayarına klonla
3. `index.html` yaz: `<header>`, `<main>`, `<section>`, `<footer>` etiketlerinin ne işe yaradığını öğrenerek
4. Depo ayarlarından GitHub Pages'i aç, adresi telefondan aç
5. İlk commit: `feat: initial page skeleton`

**Bu turda hazırlaman gerekenler:** Bir profil fotoğrafı, To-Do uygulamasının ekran görüntüsü ve Roblox oyunlarından 10–15 saniyelik oynanış kayıtları (Windows'ta Win + Alt + R ile kaydedebilirsin).
