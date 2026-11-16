# Netflix Azərbaycan

Azərbaycan kinematoqrafiyasının seçilmiş filmləri üçün qeyri-rəsmi tədris məqsədli veb-kataloq. Bu layihənin Netflix ilə heç bir əlaqəsi yoxdur.

## Lokalda işə salmaq

```bash
npm install
npm run dev
```

Brauzerdə `http://localhost:3000` ünvanını açın.

## Netlify-ə deploy etmək

1. Layihəni GitHub repozitoriyasına yükləyin.
2. Netlify panelində **Add new site -> Import an existing project** seçin.
3. `netlify.toml` faylı avtomatik oxunacaq (`npm run build` və `.next`).
4. **Deploy site** düyməsini sıxın.
