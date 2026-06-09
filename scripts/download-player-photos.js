const https = require("https");
const fs = require("fs");
const path = require("path");

const PLAYERS = [
  { name: "Marco Rossi", file: "marco-rossi.jpg" },
  { name: "Andrea Bianchi", file: "andrea-bianchi.jpg" },
  { name: "Lorenzo Verdi", file: "lorenzo-verdi.jpg" },
  { name: "Filippo Neri", file: "filippo-neri.jpg" },
  { name: "Matteo Gialli", file: "matteo-gialli.jpg" },
  { name: "Alessandro Moretti", file: "alessandro-moretti.jpg" },
  { name: "Davide Conti", file: "davide-conti.jpg" },
  { name: "Simone Marini", file: "simone-marini.jpg" },
  { name: "Luca Fontana", file: "luca-fontana.jpg" },
  { name: "Tommaso Rinaldi", file: "tommaso-rinaldi.jpg" },
  { name: "Stefano Bellini", file: "stefano-bellini.jpg" },
  { name: "Nicola Rizzo", file: "nicola-rizzo.jpg" },
];

const OUT_DIR = path.join(__dirname, "..", "assets", "images", "players");

function downloadWithRedirect(url, dest, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const go = (currentUrl, remaining) => {
      const file = fs.createWriteStream(dest);
      https.get(currentUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try { fs.unlinkSync(dest); } catch {}
          if (remaining <= 0) return reject(new Error("Too many redirects"));
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : `https://loremflickr.com${res.headers.location}`;
          return go(next, remaining - 1);
        }
        if (res.statusCode !== 200) {
          file.close();
          try { fs.unlinkSync(dest); } catch {}
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          const size = fs.statSync(dest).size;
          if (size < 500) {
            fs.unlinkSync(dest);
            reject(new Error(`Too small: ${size}b`));
          } else {
            resolve(size);
          }
        });
      }).on("error", (err) => {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        reject(err);
      });
    };
    go(url, maxRedirects);
  });
}

function downloadSimple(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        const size = fs.statSync(dest).size;
        if (size < 500) {
          fs.unlinkSync(dest);
          reject(new Error(`Too small: ${size}b`));
        } else {
          resolve(size);
        }
      });
    }).on("error", (err) => {
      file.close();
      try { fs.unlinkSync(dest); } catch {}
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  for (const player of PLAYERS) {
    const filePath = path.join(OUT_DIR, player.file);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 500) {
      console.log(`  SKIP ${player.file} (exists)`);
      continue;
    }

    const seed = player.name.toLowerCase().replace(/\s+/g, "-");
    const flickr = `https://loremflickr.com/200/200/basketball,player,jersey?random=${seed}`;
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&size=200&background=E8600A&color=fff&bold=true`;

    try {
      console.log(`  ${player.file}...`);
      await downloadWithRedirect(flickr, filePath);
      console.log(`  OK ${player.file} (Flickr)`);
    } catch (e) {
      console.log(`  Flickr failed (${e.message}), trying UI Avatars...`);
      try {
        await downloadSimple(avatar, filePath);
        console.log(`  OK ${player.file} (Avatar)`);
      } catch (e2) {
        console.error(`  FAILED ${player.file}: ${e2.message}`);
      }
    }
  }
}

main().then(() => console.log("\nDone!"));
