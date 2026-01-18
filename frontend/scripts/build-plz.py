#!/usr/bin/env python3
import json
import re
from collections import defaultdict
from pathlib import Path

SOURCE = Path("frontend/src/plz_data/DE.txt")
TARGET = Path("frontend/public/data/de-plz.json")

ADMIN_PREFIX_RE = re.compile(
    r"^(kreisfreie stadt|stadtkreis|landkreis|kreis|stadt|gemeinde|amt)\s+",
    re.IGNORECASE,
)


def normalize_admin(value: str) -> str | None:
    if not value:
        return None
    cleaned = ADMIN_PREFIX_RE.sub("", value).strip()
    return cleaned or None


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source file: {SOURCE}")

    by_plz: defaultdict[str, set[str]] = defaultdict(set)

    with SOURCE.open("r", encoding="utf-8") as handle:
        for line in handle:
            parts = line.rstrip("\n").split("\t")
            if len(parts) < 8:
                continue
            plz = parts[1].strip()
            admin3 = parts[7].strip()
            if not plz:
                continue
            admin_clean = normalize_admin(admin3)
            if admin_clean:
                by_plz[plz].add(admin_clean)

    entries: list[dict[str, str]] = []
    for plz in sorted(by_plz):
        for name in sorted(by_plz[plz]):
            entries.append({"plz": plz, "ort": name})

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", encoding="utf-8") as handle:
        json.dump(entries, handle, ensure_ascii=False)

    print(f"Wrote {len(entries)} entries to {TARGET}")


if __name__ == "__main__":
    main()
