"""Turn scripts/python-keywords.txt into the Python keyword page data.

    python scripts/import-python-keywords.py scripts/python-keywords.txt src/data/seoPythonPages.json

Copy the output to backend/data/seo-python-pages.json as well; both repos read it.
Every keyword becomes its own page; slugs never change once published.
"""
from pathlib import Path
import json
import re
import sys
import unicodedata

SOURCE = Path(sys.argv[1])
OUTPUT = Path(sys.argv[2])

DISTRICTS = ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
             "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod", "Kerala",
             "Kochi", "Trivandrum", "Calicut", "Technopark"]


def slugify(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def intent_for(title):
    value = title.lower()
    if value.endswith("?") or value.startswith(("what ", "which ", "where ", "how ", "is ", "can ", "does ", "who ")):
        return "question"
    for needle, intent in [
        ("fee", "fees"), ("admission", "admission"), ("placement", "placement"), ("internship", "internship"),
        ("after 12", "after-school"), ("plus two", "after-school"), ("graduates", "graduate"),
        ("career", "career"), ("job", "career"), ("developer", "career"), ("online", "online"),
        ("certif", "certification"), ("institute", "institute"), ("academy", "institute"), ("center", "institute"),
        ("best", "comparison"), ("top ", "comparison"), ("compare", "comparison"), ("recommend", "comparison"),
    ]:
        if needle in value:
            return intent
    return "course"


def location_for(title, towns):
    for place in DISTRICTS + sorted(towns, key=len, reverse=True):
        if re.search(rf"\b(in|from|across)\s+{re.escape(place)}\b", title, re.I):
            return place
    return ""


titles = [line.strip() for line in SOURCE.read_text(encoding="utf-8").splitlines() if line.strip()]
# Single-town searches ("Python course in Pattom") name the town after "in".
towns = {m.group(1) for t in titles if (m := re.fullmatch(r"Python course in ([A-Z][A-Za-z ]+)", t))}

pages, seen = [], set()
for title in titles:
    slug = slugify(title)
    if slug in seen:
        continue
    seen.add(slug)
    intent = intent_for(title)
    pages.append({"family": "python", "slug": slug, "title": title[0].upper() + title[1:], "label": "Python Full Stack Development",
                  "intent": intent, "location": location_for(title, towns), "question": intent == "question"})

OUTPUT.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Generated {len(pages)} Python pages")
