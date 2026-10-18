# Portfolyo sitesi — Claude Code talimatları

## Proje
Behlül Akdağ'ın kişisel portfolyo sitesi: hem staj başvuruları hem Fiverr/Upwork freelance müşterileri için.
Saf HTML, CSS ve JavaScript (framework yok), GitHub Pages'te yayınlanır.
Tüm plan, içerik, tasarım ve yol haritası `docs/PLAN.md` dosyasında. Her oturumun başında onu oku.

## En önemli kural: öğretme modu
Bu sitenin amacı Behlül'ün HTML/CSS/JS öğrenmesi. Teslim ettiği sitelerde kodu kendi başına düzenleyebilmeli.
- Kodu tek seferde büyük bloklar hâlinde yazma. Adım adım ilerle.
- Her adımda önce NE yapılacağını ve NEDEN yapıldığını kısaca anlat, sonra küçük bir parça kod yaz ya da Behlül'ün yazmasını iste.
- Yeni bir kavram geçtiğinde (semantik etiketler, Flexbox, Grid, CSS değişkenleri, DOM, IntersectionObserver vb.) 2-3 cümleyle açıkla.
- Behlül açıkça "sen yaz" demedikçe uzun kodu onun yerine yazma; ipucu ve iskelet ver.
- Hazır şablon, site oluşturucu veya CSS framework'ü (Bootstrap, Tailwind) kullanma.
- Açıklamaları Türkçe yap. Kod, sınıf adları ve commit mesajları İngilizce olsun.
- Ekranda bir yeri tarif ederken "sol, sağ, üst, alt" gibi yön ifadeleri kullan.

## Çalışma düzeni
- `docs/PLAN.md` içindeki fazları sırayla takip et; bir fazın kapısı geçilmeden sonrakine geçme.
- Her fazın sonunda PLAN.md'deki "Kalite kontrol" listesini birlikte geç.
- Her oturumun sonunda `PROGRESS.md` dosyasını güncelle: ne yapıldı, hangi görev bitti, sıradaki adım ne.
- Küçük, anlamlı commit'ler (`feat: ...`, `fix: ...`, `style: ...`).
- Demo işletme siteleri tamamen hayali markalar olmalı; gerçek bir işletmenin adı, logosu veya görselleri kullanılmaz. Her demoda "örnek çalışma" ibaresi bulunur.

## Teknik kurallar
- Önce mobil tasarla, sonra geniş ekrana uyarla.
- Tüm renkler, boşluklar ve yazı tipleri `css/variables.css` içindeki CSS değişkenlerinden gelir.
- Görseller WebP, her görselin `alt` açıklaması olur.
- `prefers-reduced-motion` açıksa animasyonlar kapanır.
- Hedef: Lighthouse'ta dört kategoride de 90 üstü.
