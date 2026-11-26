"use client";

import { useEffect, useMemo, useState } from "react";

type ApiRow = Record<string, any>;
type FitmentChoice = {
  id: string;
  vehicle: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  region: string;
  source: "OE" | "OPTIONAL";
  front: string;
  rear: string;
  pcd: string;
  raw: ApiRow;
};

type SelectOption = { value: string; label: string };
const STORAGE_KEY = "euresis.vehicle-fitment.v1";
const regions: SelectOption[] = [
  { value: "jdm", label: "Japan" }, { value: "eudm", label: "Europe" },
  { value: "usdm", label: "USA" }, { value: "cdm", label: "Canada" },
  { value: "chdm", label: "China" }, { value: "skdm", label: "South Korea" },
  { value: "audm", label: "Oceania" }, { value: "sam", label: "Southeast Asia" },
];

const readRows = (payload: any): ApiRow[] =>
  Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

const toOptions = (items: ApiRow[], key: string): SelectOption[] =>
  items.map((item) => typeof item === "string" || typeof item === "number"
    ? { value: String(item), label: String(item) }
    : {
        value: String(item.slug ?? item.id ?? item[key] ?? item.name ?? item.year ?? ""),
        label: String(item.name ?? item.title ?? item.trim ?? item.year ?? item.slug ?? ""),
      }).filter((item) => item.value && item.label);

const valueOf = (object: ApiRow, ...keys: string[]) =>
  keys.map((key) => object?.[key]).find((value) => value !== undefined && value !== null && value !== "");

const formatWheel = (wheel: ApiRow | undefined): string => {
  if (!wheel) return "—";
  const diameter = valueOf(wheel, "rim_diameter", "diameter", "rim") ;
  const width = valueOf(wheel, "rim_width", "width");
  const offset = valueOf(wheel, "rim_offset", "offset");
  const size = [width ? `${width}J` : "", diameter ? `× ${diameter}"` : ""].filter(Boolean).join(" ");
  return [size, offset !== undefined ? `ET${offset}` : ""].filter(Boolean).join(" · ") || "Specification available";
};

export function GlobalVehicleFitmentBar() {
  const [region, setRegion] = useState("jdm");
  const [makes, setMakes] = useState<ApiRow[]>([]);
  const [models, setModels] = useState<ApiRow[]>([]);
  const [years, setYears] = useState<ApiRow[]>([]);
  const [trims, setTrims] = useState<ApiRow[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");
  const [results, setResults] = useState<FitmentChoice[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [saved, setSaved] = useState<FitmentChoice[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [error, setError] = useState("");

  async function load(resource: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params);
    const response = await fetch(`/api/wheel-size/${resource}?${query.toString()}`);
    const body: any = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? body?.detail ?? "Vehicle data is temporarily unavailable.");
    return body;
  }

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setSaved(parsed);
      }
    } catch { /* Ignore invalid local data and continue with an empty garage. */ }
    load("makes").then((payload) => setMakes(readRows(payload))).catch((reason) => setError(reason.message)).finally(() => setLoadingMakes(false));
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* Storage may be unavailable. */ }
    window.dispatchEvent(new CustomEvent("euresis:fitment-selections-changed", { detail: { selections: saved } }));
  }, [saved]);

  useEffect(() => {
    if (!make) { setModels([]); return; }
    load("models", { make, region }).then((payload) => setModels(readRows(payload))).catch((reason) => setError(reason.message));
    setModel(""); setYear(""); setTrim(""); setYears([]); setTrims([]); setResults([]); setPending([]);
  }, [make, region]);

  useEffect(() => {
    if (!make || !model) { setYears([]); return; }
    load("years", { make, model, region }).then((payload) => setYears(readRows(payload))).catch((reason) => setError(reason.message));
    setYear(""); setTrim(""); setTrims([]); setResults([]); setPending([]);
  }, [make, model, region]);

  useEffect(() => {
    if (!make || !model || !year) { setTrims([]); return; }
    load("modifications", { make, model, year, region }).then((payload) => setTrims(readRows(payload))).catch((reason) => setError(reason.message));
    setTrim(""); setResults([]); setPending([]);
  }, [make, model, year, region]);

  const makeOptions = useMemo(() => makes.map((item) => ({
    value: String(item.slug ?? item.id ?? item.name ?? ""),
    label: String(item.name ?? item.title ?? item.slug ?? ""),
  })).filter((item) => item.value), [makes]);

  async function searchFitment() {
    if (!make || !model || !year || !trim) return;
    setLoading(true); setError(""); setResults([]); setPending([]);
    try {
      const payload = await load("search", { make, model, year, modification: trim, region, limit: "100" });
      const vehicleRows = readRows(payload);
      const next: FitmentChoice[] = [];
      vehicleRows.forEach((vehicle) => {
        const wheels = Array.isArray(vehicle.wheels) ? vehicle.wheels : [];
        wheels.forEach((wheel: ApiRow, index: number) => {
          const front = wheel.front ?? wheel;
          const rear = wheel.rear;
          const source = wheel.is_stock || wheel.type === "OE" || wheel.type === "stock" || index === 0 ? "OE" : "OPTIONAL";
          const vehicleName = [year, makeOptions.find((item) => item.value === make)?.label ?? make, model, trim].join(" ");
          const id = [make, model, year, trim, wheel.id ?? wheel.slug ?? index, JSON.stringify(wheel)].join("|");
          const pcd = valueOf(front, "bolt_pattern", "pcd", "bolt_pattern_full") ?? valueOf(wheel, "bolt_pattern", "pcd", "bolt_pattern_full") ?? valueOf(vehicle.technical ?? {}, "bolt_pattern", "pcd") ?? "";
          next.push({
            id, vehicle: vehicleName, make, model, year, trim, region, source,
            front: formatWheel(front), rear: rear ? formatWheel(rear) : "—",
            pcd: String(pcd || "—"), raw: wheel,
          });
        });
      });
      setResults(next);
      if (!next.length) setError("No wheel specifications were returned. Try another market, year or trim.");
      else setPanelOpen(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to retrieve vehicle specifications.");
    } finally { setLoading(false); }
  }

  function addSelected() {
    const additions = results.filter((item) => pending.includes(item.id));
    setSaved((current) => {
      const existing = new Set(current.map((item) => item.id));
      return [...current, ...additions.filter((item) => !existing.has(item.id))];
    });
    setPending([]);
    setPanelOpen(false);
  }

  function updateField(field: "make" | "model" | "year" | "trim" | "region", value: string) {
    if (field === "make") setMake(value);
    if (field === "model") setModel(value);
    if (field === "year") setYear(value);
    if (field === "trim") setTrim(value);
    if (field === "region") setRegion(value);
  }

  return (
    <section className="global-fitment" aria-label="Global vehicle fitment finder">
      <div className="global-fitment__inner">
        <div className="global-fitment__finder">
          <div className="global-fitment__label"><span className="global-fitment__mark" aria-hidden="true">◎</span><span>FIND YOUR FITMENT</span></div>
          <div className="global-fitment__fields">
            <label><span>MARKET</span><select value={region} onChange={(event) => updateField("region", event.target.value)}>{regions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>MAKE</span><select value={make} onChange={(event) => updateField("make", event.target.value)} disabled={loadingMakes}><option value="">{loadingMakes ? "Loading…" : "Select make"}</option>{makeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>MODEL</span><select value={model} onChange={(event) => updateField("model", event.target.value)} disabled={!make}><option value="">Select model</option>{toOptions(models, "model").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>YEAR</span><select value={year} onChange={(event) => updateField("year", event.target.value)} disabled={!model}><option value="">Select year</option>{toOptions(years, "year").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <label><span>TRIM</span><select value={trim} onChange={(event) => updateField("trim", event.target.value)} disabled={!year}><option value="">Select trim</option>{toOptions(trims, "modification").map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
            <button className="global-fitment__search" type="button" disabled={!make || !model || !year || !trim || loading} onClick={searchFitment}>{loading ? "SEARCHING…" : "SEARCH"} <span aria-hidden="true">↗</span></button>
          </div>
        </div>

        {(saved.length > 0 || error) && <div className="global-fitment__saved" aria-live="polite">
          <div className="global-fitment__chips">
            {saved.length > 0 ? saved.map((item) => (
              <span className="global-fitment__chip" key={item.id} title={`${item.vehicle} · Front ${item.front} · Rear ${item.rear} · PCD ${item.pcd}`}>
                <span>{item.vehicle}</span><small>{item.source} · {item.front}</small>
                <button type="button" aria-label={`Remove ${item.vehicle} wheel specification`} onClick={() => setSaved((current) => current.filter((entry) => entry.id !== item.id))}>×</button>
              </span>
            )) : null}
          </div>
          {saved.length > 0 && <button className="global-fitment__edit" type="button" onClick={() => setPanelOpen((open) => !open)}>{panelOpen ? "CLOSE" : "EDIT VEHICLES"}</button>}
          {error && <span className="global-fitment__error" role="status">{error}</span>}
        </div>}

        {panelOpen && <div className="global-fitment__results">
          <div className="global-fitment__results-head"><div><strong>SELECT WHEEL SPECIFICATIONS</strong><span>{results.length} results · Select one or more</span></div><button type="button" onClick={() => setPanelOpen(false)} aria-label="Close results">×</button></div>
          {results.length > 0 ? <div className="global-fitment__result-list">
            {results.map((item) => <label className="global-fitment__result" key={item.id}>
              <input type="checkbox" checked={pending.includes(item.id)} onChange={(event) => setPending((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} />
              <span className="global-fitment__result-vehicle"><strong>{item.vehicle}</strong><small>{item.source === "OE" ? "ORIGINAL EQUIPMENT" : "OPTIONAL SPECIFICATION"}</small></span>
              <span><small>FRONT</small><strong>{item.front}</strong></span>
              <span><small>REAR</small><strong>{item.rear}</strong></span>
              <span><small>PCD</small><strong>{item.pcd}</strong></span>
            </label>)}
          </div> : <p className="global-fitment__empty">Choose a vehicle above and search to load wheel specifications.</p>}
          {results.length > 0 && <div className="global-fitment__results-foot"><span>{pending.length} selected</span><button type="button" disabled={!pending.length} onClick={addSelected}>ADD SELECTED TO BAR <span aria-hidden="true">↗</span></button></div>}
        </div>}
      </div>
    </section>
  );
}
