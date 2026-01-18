export type PlzEntry = {
  plz: string;
  ort: string;
  label: string;
  search: string;
};

type PlzIndex = {
  entries: PlzEntry[];
  labelSet: Set<string>;
};

let plzIndexPromise: Promise<PlzIndex> | null = null;

const loadIndex = async (): Promise<PlzIndex> => {
  if (!plzIndexPromise) {
    plzIndexPromise = fetch("/data/de-plz.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("PLZ-Daten konnten nicht geladen werden.");
        }
        return response.json() as Promise<Array<{ plz: string; ort: string }>>;
      })
      .then((raw) => {
        const entries = raw.map((item) => {
          const label = `${item.plz} ${item.ort}`.trim();
          return {
            plz: item.plz,
            ort: item.ort,
            label,
            search: label.toLowerCase(),
          };
        });
        const labelSet = new Set(
          entries.map((entry) => normalizePlzInput(entry.label).toLowerCase()),
        );
        return { entries, labelSet };
      });
  }
  return plzIndexPromise;
};

export const normalizePlzInput = (value: string) => value.trim().replace(/\s+/g, " ");

export const isValidPlzInput = async (value: string) => {
  const normalized = normalizePlzInput(value);
  if (!/^\d{5}\s+\S+/.test(normalized)) {
    return false;
  }
  const { labelSet } = await loadIndex();
  return labelSet.has(normalized.toLowerCase());
};

export const findPlzMatches = async (value: string, limit = 8): Promise<PlzEntry[]> => {
  const normalized = normalizePlzInput(value);
  if (normalized.length < 2) {
    return [];
  }
  const needle = normalized.toLowerCase();
  const { entries, labelSet } = await loadIndex();
  if (labelSet.has(needle)) {
    return [];
  }
  return entries
    .filter((entry) => entry.search.startsWith(needle) || entry.search.includes(needle))
    .slice(0, limit);
};
