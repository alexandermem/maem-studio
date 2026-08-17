from pathlib import Path
from bs4 import BeautifulSoup
import sys

ROOT = Path(__file__).resolve().parents[1] / "public"
errors = []

for html in ROOT.rglob("*.html"):
    if html.name.startswith('google'):
        continue
    text = html.read_text(encoding="utf-8")
    soup = BeautifulSoup(text, "html.parser")

    if soup.find("h1") is None:
        errors.append(f"{html.relative_to(ROOT)}: falta H1")

    title = soup.find("title")
    if not title or not title.get_text(strip=True):
        errors.append(f"{html.relative_to(ROOT)}: falta title")

    for tag, attr in [("a","href"),("img","src"),("link","href"),("script","src")]:
        for node in soup.find_all(tag):
            val = node.get(attr)
            if not val or val.startswith(("http://","https://","mailto:","tel:","data:","javascript:")):
                continue

            # Ignore pure in-page anchors.
            if val.startswith("#"):
                continue

            path_only = val.split("#", 1)[0].split("?", 1)[0]

            # Root URL with a fragment, e.g. /#contacto -> public/index.html
            if path_only == "/":
                target = ROOT / "index.html"
            elif path_only.startswith("/"):
                target = ROOT / path_only.lstrip("/")
            else:
                target = html.parent / path_only

            if path_only.endswith("/") and target != ROOT / "index.html":
                target = target / "index.html"
            elif target.is_dir():
                target = target / "index.html"

            if not target.exists():
                errors.append(f"{html.relative_to(ROOT)}: referencia rota {val}")

if errors:
    print("ERRORES:")
    for e in errors:
        print("-", e)
    sys.exit(1)

print("OK: estructura HTML y referencias locales básicas válidas.")
