# Music Organizer - Telepítési Útmutató (Arch Linux)

Teljes körű telepítési és konfigurációs útmutató a Music Organizer eszközhöz Arch Linux rendszeren.

---

## Tartalomjegyzék

1. [Rendszerkövetelmények](#rendszerkövetelmények)
2. [Node.js és npm telepítése](#nodejs-és-npm-telepítése)
3. [Music Organizer telepítése](#music-organizer-telepítése)
4. [API kulcsok beszerzése](#api-kulcsok-beszerzése)
5. [Konfiguráció](#konfiguráció)
6. [Első futtatás](#első-futtatás)
7. [Troubleshooting](#troubleshooting)

---

## Rendszerkövetelmények

- **OS:** Arch Linux (frissített rendszer)
- **Node.js:** v18.x vagy újabb (LTS ajánlott)
- **npm:** v9.x vagy újabb
- **Python:** 3.x (néhány natív modul fordításához)
- **Git:** verziókezeléshez
- **Lemezterület:** Minimum 100 MB a programhoz + ideiglenes tárterület a library duplikálásához
- **Hálózat:** Internet kapcsolat az API hívásokhoz

---

## Node.js és npm telepítése

### 1. Frissítsd a rendszert

```bash
sudo pacman -Syu
```

### 2. Telepítsd a Node.js-t és npm-et

```bash
sudo pacman -S nodejs npm
```

### 3. Ellenőrizd a telepítést

```bash
node --version
# Várt kimenet: v20.x.x vagy v18.x.x

npm --version
# Várt kimenet: v9.x.x vagy újabb
```

### 4. (Opcionális) Globális npm csomagok jogosultság beállítása

Hogy ne kelljen `sudo`-t használni globális csomagok telepítéséhez:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add hozzá a PATH-hoz
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Ha `zsh`-t használsz:

```bash
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

### 5. Telepítsd a build eszközöket (natív modulokhoz)

```bash
sudo pacman -S base-devel python
```

---

## Music Organizer telepítése

### Opció A: NPM-ből (amikor publikálva lesz)

```bash
npm install -g music-organizer
```

### Opció B: Forrásból (fejlesztés/tesztelés)

#### 1. Klónozd a repository-t

```bash
cd ~/Projects
git clone https://github.com/your-username/music-organizer.git
cd music-organizer
```

#### 2. Telepítsd a függőségeket

```bash
npm install
```

#### 3. Build TypeScript → JavaScript

```bash
npm run build
```

#### 4. Link globálisan (fejlesztési mód)

```bash
npm link
```

Ez létrehoz egy szimbolikus linket, hogy a `music-organizer` parancsot bárhonnan futtasd.

#### 5. Ellenőrizd a telepítést

```bash
music-organizer --version
music-organizer --help
```

---

## API kulcsok beszerzése

A Music Organizer három külső szolgáltatást használ a műfaj besoroláshoz:

1. **MusicBrainz** - Ingyenes, **nincs szükség API kulcsra**
2. **Discogs** - Ingyenes API kulcs szükséges
3. **Claude (Anthropic)** - API kulcs szükséges (fizetős, de olcsó)

---

### 1. MusicBrainz (Ingyenes, nincs kulcs)

A MusicBrainz nem igényel API kulcsot, de kérnek néhány információt az alkalmazásról.

**Nincs teendő**, csak a konfigurációban add meg az app nevet (lásd később).

**Rate limit:** 1 kérés/másodperc
**Dokumentáció:** https://musicbrainz.org/doc/MusicBrainz_API

---

### 2. Discogs API kulcs beszerzése

#### Lépések:

1. **Regisztrálj egy Discogs fiókot** (ha még nincs)
   - Menj ide: https://www.discogs.com/users/create
   - Töltsd ki a regisztrációs űrlapot
   - Erősítsd meg az email címedet

2. **Generálj API kulcsot**
   - Jelentkezz be: https://www.discogs.com/login
   - Menj a Settings → Developer oldalra: https://www.discogs.com/settings/developers
   - Kattints a **"Generate new token"** gombra

3. **Hozz létre egy új alkalmazást**
   - **Application name:** `Music Organizer`
   - **Description:** `Personal music library organization tool`
   - Kattints **"Save"**

4. **Másold ki a kulcsokat**
   
   Két kulcsot kapsz:
   - **Consumer Key** - ezt használjuk
   - **Consumer Secret** - ezt is használjuk (enhanced rate limit-hez)

   **Példa:**
   ```
   Consumer Key: AbCdEfGhIjKlMnOpQrSt
   Consumer Secret: XyZaBcDeFgHiJkLmNoPq
   ```

   ⚠️ **Fontos:** Soha ne oszd meg ezeket a kulcsokat!

5. **Rate Limits**
   - Authentikáció nélkül: 60 kérés/perc
   - Authentikációval: 240 kérés/perc

**Dokumentáció:** https://www.discogs.com/developers

---

### 3. Claude API kulcs beszerzése (Anthropic)

A Claude API-t használjuk az intelligens műfaj besoroláshoz (csak a nehéz eseteknél, ~5-10%).

#### Lépések:

1. **Regisztrálj az Anthropic Console-ra**
   - Menj ide: https://console.anthropic.com/
   - Kattints **"Sign Up"**
   - Használhatsz Google-t vagy email címet

2. **Add meg a fizetési információkat**
   - Menj a **Settings → Billing** oldalra
   - Add meg a bankkártya adataidat
   - **Nem lesz azonnali terhelés**, csak használat alapú fizetés
   
3. **Generálj API kulcsot**
   - Menj a **Settings → API Keys** oldalra: https://console.anthropic.com/settings/keys
   - Kattints **"Create Key"**
   - **Name:** `Music Organizer`
   - Kattints **"Create Key"**

4. **Másold ki a kulcsot**
   
   ⚠️ **FONTOS:** Ez az egyetlen alkalom, amikor látod a teljes kulcsot!
   
   ```
   sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   
   Mentsd el biztonságos helyre (pl. password manager).

5. **Költségek és rate limits**
   
   - **Model:** Claude Sonnet 4.5
   - **Pricing:** $3/M input tokens, $15/M output tokens
   - **Rate limit:** Nincs szigorú limit, de ésszerű használat ajánlott
   
   **Becsült költség 3000 albumos könyvtárra:**
   - AI-val besorolt albumok: ~150-300 (5-10%)
   - **Költség: $0.40 - $0.80**

6. **Hitelkeret beállítása (ajánlott)**
   
   Hogy ne legyen meglepetés:
   - Menj a **Settings → Billing → Usage limits**
   - Állíts be egy limitet, pl. **$5/hónap**
   - Így garantált, hogy nem költesz többet

**Dokumentáció:** https://docs.anthropic.com/

---

## Konfiguráció

### 1. Hozd létre a konfigurációs könyvtárat

```bash
mkdir -p ~/.config/music-organizer
```

### 2. Hozz létre `.env` fájlt

```bash
nano ~/.config/music-organizer/.env
```

Vagy VS Code-dal:

```bash
code ~/.config/music-organizer/.env
```

### 3. Add meg az API kulcsokat

Illeszd be a következő tartalmat a `.env` fájlba:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here

# Discogs API
DISCOGS_API_KEY=your_discogs_consumer_key_here
DISCOGS_API_SECRET=your_discogs_consumer_secret_here

# MusicBrainz (opcionális)
MUSICBRAINZ_APP_NAME=music-organizer
MUSICBRAINZ_APP_VERSION=1.0.0
MUSICBRAINZ_CONTACT=your.email@example.com

# Logging
LOG_LEVEL=info
LOG_FILE=~/.local/share/music-organizer/app.log
```

**Fontos:** Cseréld ki a placeholder értékeket a valódi kulcsokra!

### 4. Állítsd be a fájl jogosultságait

```bash
chmod 600 ~/.config/music-organizer/.env
```

Ez biztosítja, hogy csak te olvashatod a fájlt.

### 5. Hozz létre konfigurációs fájlt

```bash
nano ~/.config/music-organizer/config.json
```

Minimális konfiguráció:

```json
{
  "genreClassification": {
    "strategy": "hybrid",
    "stages": {
      "flacMetadata": { "enabled": true, "priority": 1 },
      "musicbrainz": { 
        "enabled": true, 
        "priority": 2,
        "rateLimit": 1,
        "minConfidence": 0.7
      },
      "discogs": { 
        "enabled": true, 
        "priority": 3,
        "minConfidence": 0.6
      },
      "aiClassification": {
        "enabled": true,
        "priority": 4,
        "provider": "claude",
        "model": "claude-sonnet-4-5-20250929",
        "batchSize": 50,
        "minConfidence": 0.5
      }
    },
    "manualReview": {
      "enabled": true,
      "lowConfidenceThreshold": 0.7
    },
    "caching": {
      "enabled": true,
      "cacheFile": "~/.cache/music-organizer/genre-cache.json"
    }
  },
  "classical": {
    "multipleRecordings": {
      "enabled": true,
      "performerSubfolders": true,
      "abbreviateOrchestras": true
    }
  },
  "fileOperations": {
    "mode": "copy",
    "backupEnabled": true,
    "verifyIntegrity": true
  }
}
```

### 6. Hozd létre a cache könyvtárat

```bash
mkdir -p ~/.cache/music-organizer
mkdir -p ~/.local/share/music-organizer
```

---

## Első futtatás

### 1. Teszteld a konfigurációt

```bash
music-organizer test-config
```

Ez ellenőrzi:
- API kulcsok érvényesek-e
- MusicBrainz elérhető-e
- Discogs API működik-e
- Claude API hozzáférhető-e

**Példa kimenet:**
```
✓ Configuration file found
✓ MusicBrainz API: Connected
✓ Discogs API: Authenticated
✓ Claude API: Valid key, quota available
✓ All systems ready!
```

### 2. Futtass egy kis tesztet

Először próbáld ki egy kis részhalmazon (pl. 1 előadó):

```bash
music-organizer analyze ~/Music/Alternative/Bauhaus --dry-run
```

Ez csak elemez, nem mozgat fájlokat.

### 3. Nézd meg az eredményt

```bash
cat analysis-report.json
```

### 4. Ha minden rendben, folytasd a teljes könyvtárral

Lásd a főbb használati útmutatót a `music-organizer-prompt.md` fájlban.

---

## NAS-ra való csatlakozás (ha szükséges)

Ha a zenéid NAS-on vannak:

### NFS mount

```bash
# Telepítsd az nfs-utils-t
sudo pacman -S nfs-utils

# Mount-old a NAS-t
sudo mkdir -p /mnt/nas/music
sudo mount -t nfs nas.local:/volume1/music /mnt/nas/music

# Automatikus mount boot-kor (/etc/fstab)
echo "nas.local:/volume1/music /mnt/nas/music nfs defaults 0 0" | sudo tee -a /etc/fstab
```

### SMB/CIFS mount (Samba)

```bash
# Telepítsd a cifs-utils-t
sudo pacman -S cifs-utils

# Mount-old a NAS-t
sudo mkdir -p /mnt/nas/music
sudo mount -t cifs //nas.local/music /mnt/nas/music -o username=yourusername,password=yourpassword

# Vagy credentials fájllal (biztonságosabb)
echo "username=yourusername" > ~/.nas-credentials
echo "password=yourpassword" >> ~/.nas-credentials
chmod 600 ~/.nas-credentials

sudo mount -t cifs //nas.local/music /mnt/nas/music -o credentials=/home/yourusername/.nas-credentials

# Automatikus mount (/etc/fstab)
echo "//nas.local/music /mnt/nas/music cifs credentials=/home/yourusername/.nas-credentials 0 0" | sudo tee -a /etc/fstab
```

### Ellenőrizd a mount-ot

```bash
df -h | grep nas
ls -la /mnt/nas/music
```

---

## Frissítés

### Ha npm-ből telepítetted:

```bash
npm update -g music-organizer
```

### Ha forrásból telepítetted:

```bash
cd ~/Projects/music-organizer
git pull origin main
npm install
npm run build
```

---

## Eltávolítás

### Ha npm-ből telepítetted:

```bash
npm uninstall -g music-organizer
```

### Ha forrásból telepítetted:

```bash
cd ~/Projects/music-organizer
npm unlink
cd ..
rm -rf music-organizer
```

### Konfiguráció és cache törlése:

```bash
rm -rf ~/.config/music-organizer
rm -rf ~/.cache/music-organizer
rm -rf ~/.local/share/music-organizer
```

---

## Troubleshooting

### 1. "Command not found: music-organizer"

**Probléma:** A PATH nem tartalmazza az npm global bin könyvtárat.

**Megoldás:**

```bash
# Ellenőrizd, hol van a global bin
npm config get prefix

# Ha ~/.npm-global, akkor add hozzá a PATH-hoz
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### 2. "EACCES: permission denied" npm install közben

**Probléma:** Nincs jogod írni a globális npm könyvtárba.

**Megoldás:**

Állítsd be az npm prefix-et (lásd fentebb a Node.js telepítési résznél).

### 3. "API key invalid" hiba

**Probléma:** Az API kulcs hibás vagy lejárt.

**Megoldás:**

```bash
# Ellenőrizd a .env fájlt
cat ~/.config/music-organizer/.env

# Teszteld a kulcsokat
music-organizer test-config

# Ha szükséges, generálj új kulcsot és frissítsd
nano ~/.config/music-organizer/.env
```

### 4. "Cannot find module" hiba

**Probléma:** Hiányzó függőségek.

**Megoldás:**

```bash
cd ~/Projects/music-organizer
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 5. NAS mount problémák

**Probléma:** Nem lehet hozzáférni a NAS-hoz.

**Megoldás:**

```bash
# Ellenőrizd a hálózati kapcsolatot
ping nas.local

# Ellenőrizd a mount-ot
mount | grep nas

# Újra mount-olás
sudo umount /mnt/nas/music
sudo mount -a

# Nézd meg a rendszer logokat
sudo journalctl -xe | grep mount
```

### 6. Python build errors natív moduloknál

**Probléma:** Hiányzó Python vagy build tools.

**Megoldás:**

```bash
sudo pacman -S base-devel python

# Újra próbálkozás
npm install
```

### 7. Claude API quota exceeded

**Probléma:** Elérted a havi limitet.

**Megoldás:**

- Ellenőrizd az Anthropic Console-on: https://console.anthropic.com/settings/usage
- Növeld a limitet vagy várj a következő hónapig
- Vagy ideiglenesen kapcsold ki az AI besorolást:
  ```json
  "aiClassification": { "enabled": false }
  ```

---

## Hasznos linkek

- **Music Organizer GitHub:** (amikor publikálva lesz)
- **Node.js dokumentáció:** https://nodejs.org/docs/
- **Arch Wiki - Node.js:** https://wiki.archlinux.org/title/Node.js
- **MusicBrainz API:** https://musicbrainz.org/doc/MusicBrainz_API
- **Discogs API:** https://www.discogs.com/developers
- **Anthropic Claude API:** https://docs.anthropic.com/

---

## Következő lépések

Miután sikeresen telepítetted és konfiguráltad a programot:

1. Olvasd el a főbb használati útmutatót
2. Futtass egy teljes elemzést a könyvtáradon
3. Tekintsd át a besorolási eredményeket
4. Végezd el a manuális review-t
5. Futtasd le a reorganizációt (copy módban!)

**Jó szórakozást a rendezett zenekönyvtárhoz!** 🎵

---

*Utolsó frissítés: 2025-10-05*
*Verzió: 1.0.0*
