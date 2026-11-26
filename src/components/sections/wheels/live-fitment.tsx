"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PButton, PHeading, PSelect, PSelectOption } from "@porsche-design-system/components-react/ssr";

type SelectUpdateEvent = CustomEvent<{ value?: string | number | null }>;
type ApiRow = Record<string, any>;
const regions = [
  ["usdm", "USA+"], ["cdm", "Canada"], ["mxndm", "Mexico"], ["ladm", "Central & South America"],
  ["eudm", "Europe"], ["rus", "Russia+"], ["jdm", "Japan"], ["chdm", "China / Hong Kong / Macao"],
  ["skdm", "South Korea"], ["sam", "Southeast Asia"], ["medm", "Middle East"],
  ["nadm", "North Africa"], ["sadm", "South Africa"], ["audm", "Oceania"],
] as const;
const readData = (payload: any): ApiRow[] => Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

export function LiveFitment() {
  const [makes, setMakes] = useState<ApiRow[]>([]);
  const [models, setModels] = useState<ApiRow[]>([]);
  const [years, setYears] = useState<ApiRow[]>([]);
  const [trims, setTrims] = useState<ApiRow[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [trim, setTrim] = useState("");
  const [region, setRegion] = useState("jdm");
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queried, setQueried] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const liveRegion = useRef<HTMLDivElement>(null);

  async function load(resource: string, params: Record<string, string> = {}) {
    const query = new URLSearchParams(params);
    const response = await fetch(`/api/wheel-size/${resource}?${query.toString()}`);
    const body: any = await response.json();
    if (!response.ok) throw new Error(body?.error?.message ?? body?.detail ?? "Wheel fitment service unavailable.");
    return body;
  }

  useEffect(() => {
    load("makes").then((payload) => setMakes(readData(payload))).catch((reason) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!make) { setModels([]); return; }
    load("models", { make, region }).then((payload) => setModels(readData(payload))).catch((reason) => setError(reason.message));
    setModel(""); setYear(""); setTrim(""); setYears([]); setTrims([]); setRows([]); setQueried(false);
  }, [make, region]);

  useEffect(() => {
    if (!make || !model) { setYears([]); return; }
    load("years", { make, model, region }).then((payload) => setYears(readData(payload))).catch((reason) => setError(reason.message));
    setYear(""); setTrim(""); setTrims([]); setRows([]); setQueried(false);
  }, [make, model, region]);

  useEffect(() => {
    if (!make || !model || !year) { setTrims([]); return; }
    load("modifications", { make, model, year, region }).then((payload) => setTrims(readData(payload))).catch((reason) => setError(reason.message));
    setTrim(""); setRows([]); setQueried(false);
  }, [make, model, year, region]);

  const makeOptions = useMemo(() => makes.map((item) => ({
    slug: String(item.slug ?? item.id ?? item.name ?? ""),
    name: String(item.name ?? item.title ?? item.slug ?? ""),
    logo: typeof item.logo === "string" ? item.logo : item.logo?.url ?? item.logo?.src ?? item.image ?? "",
  })).filter((item) => item.slug), [makes]);

  const options = (items: ApiRow[], key: string) => items.map((item) => typeof item === "string" || typeof item === "number" ? ({ value: String(item), label: String(item) }) : ({
    value: String(item.slug ?? item.id ?? item[key] ?? item.name ?? item.year ?? ""),
    label: String(item.name ?? item.title ?? item.trim ?? item.year ?? item.slug ?? ""),
  })).filter((item) => item.value);

  async function search() {
    setLoading(true); setError(""); setRows([]); setQueried(false);
    try {
      const payload = await load("search", { make, model, year, modification: trim, region, limit: "100" });
      const data = readData(payload);
      const results: ApiRow[] = [];
      data.forEach((vehicle) => {
        const wheels = Array.isArray(vehicle.wheels) ? vehicle.wheels : [];
        wheels.forEach((wheel: ApiRow, index: number) => results.push({
          ...wheel, _vehicle: vehicle, _id: `${vehicle.modification?.slug ?? vehicle.modification ?? vehicle.make?.slug ?? make}-${index}`,
          _type: wheel.is_stock || wheel.type === "OE" || wheel.type === "stock" || index === 0 ? "OE" : "OPTIONAL",
        }));
      });
      setRows(results);
      setQueried(true);
      if (!results.length) setError("No wheel specifications were found for this vehicle and market. Try another year, trim or region.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to retrieve wheel specifications. Please try again.");
    } finally { setLoading(false); }
  }

  function choose(row: ApiRow) {
    const front = row.front ?? row;
    const rear = row.rear ?? front;
    const rim = front.rim_diameter ?? front.rim?.diameter ?? front.diameter;
    const width = front.rim_width ?? front.rim?.width ?? front.width;
    const offset = front.rim_offset ?? front.rim?.offset ?? front.offset;
    const pcd = front.bolt_pattern ?? front.pcd ?? front.bolt_pattern_full ?? row.bolt_pattern ?? row.pcd ?? row._vehicle?.technical?.bolt_pattern ?? row.technical?.bolt_pattern ?? "";
    const detail = { diameter: rim ? String(rim) : "ALL", width: width ? String(width) : "", offset: offset ? String(offset) : "", pcd, rearDiameter: rear.rim_diameter ?? "", source: row._type, make, model, year, trim };
    window.dispatchEvent(new CustomEvent("euresis:fitment-selected", { detail }));
    setSelected((current) => [...current, row._id]);
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.querySelector<HTMLInputElement>('[name="catalogue-diameter"]')?.focus(), 450);
  }

  return (
    <section className="wheels-fitment scheme-light" id="vehicle-fitment" aria-labelledby="fitment-title">
      <div className="wheels-fitment__intro">
        <p className="wheels-eyebrow">03 / VEHICLE FITMENT</p>
        <PHeading id="fitment-title" tag="h2" size="2xl">START WITH<br />YOUR VEHICLE.</PHeading>
        <p>Choose your vehicle to retrieve original and optional wheel specifications. You can then transfer any result into the specification filters and continue refining your search. Vehicle selection is optional when you already know your wheel parameters.</p>
      </div>
      <div className="wheels-fitment__form">
        <div className="wheels-fitment__fields wheels-fitment__fields--live">
          <PSelect label="Vehicle market" name="vehicle-region" value={region} onChange={(event: SelectUpdateEvent) => setRegion(String(event.detail.value ?? "jdm"))}>
            {regions.map(([value, label]) => <PSelectOption key={value} value={value}>{label}</PSelectOption>)}
          </PSelect>
          <PSelect label="Make" name="vehicle-make" value={make} onChange={(event: SelectUpdateEvent) => setMake(String(event.detail.value ?? ""))}>
            <PSelectOption value="">Select make</PSelectOption>
            {makeOptions.map((item) => <PSelectOption key={item.slug} value={item.slug}><span className="make-option"><span className="make-option__logo">{item.logo ? <img src={item.logo} alt="" loading="lazy" /> : null}</span><span>{item.name}</span></span></PSelectOption>)}
          </PSelect>
          <PSelect label="Model" name="vehicle-model" value={model} disabled={!make} onChange={(event: SelectUpdateEvent) => setModel(String(event.detail.value ?? ""))}>
            <PSelectOption value="">Select model</PSelectOption>
            {options(models, "model").map((item) => <PSelectOption key={item.value} value={item.value}>{item.label}</PSelectOption>)}
          </PSelect>
          <PSelect label="Year" name="vehicle-year" value={year} disabled={!model} onChange={(event: SelectUpdateEvent) => setYear(String(event.detail.value ?? ""))}>
            <PSelectOption value="">Select year</PSelectOption>
            {options(years, "year").map((item) => <PSelectOption key={item.value} value={item.value}>{item.label}</PSelectOption>)}
          </PSelect>
          <PSelect label="Trim / Modification" name="vehicle-trim" value={trim} disabled={!year} onChange={(event: SelectUpdateEvent) => setTrim(String(event.detail.value ?? ""))}>
            <PSelectOption value="">Select trim</PSelectOption>
            {options(trims, "modification").map((item) => <PSelectOption key={item.value} value={item.value}>{item.label}</PSelectOption>)}
          </PSelect>
        </div>
        <PButton type="button" disabled={!make || !model || !year || !trim || loading} onClick={search}>{loading ? "Searching..." : "Search wheel fitment"}</PButton>
        {error && <p className="wheels-fitment__api-error" role="alert">{error}</p>}
        {queried && rows.length > 0 && <div className="wheels-fitment__results" ref={liveRegion} aria-live="polite">
          <div className="wheels-fitment__results-heading"><strong>{rows.length} 组适配参数</strong><span>原厂规格 / 可选规格</span></div>
          <div className="wheels-fitment__table-wrap"><table className="wheels-fitment__table">
            <thead><tr><th>类型</th><th>位置</th><th>轮毂尺寸</th><th>ET 值</th><th>PCD</th><th>轮胎尺寸</th><th>操作</th></tr></thead>
            <tbody>{rows.map((row) => {
              const front = row.front ?? row;
              const rear = row.rear;
              const vehicleTechnical = row._vehicle?.technical ?? {};
              const get = (wheel: ApiRow, ...keys: string[]) => keys.map((key) => wheel?.[key]).find((value) => value !== undefined && value !== null && value !== "");
              const format = (value: any): string => value == null || value === "" ? "—" : typeof value === "object" ? String(value.value ?? value.name ?? value.label ?? JSON.stringify(value)) : String(value);
              const positionRows = [
                { label: "Front", wheel: front },
                ...(rear ? [{ label: "Rear", wheel: rear }] : []),
              ];
              return positionRows.map(({ label, wheel }) => {
                const rim = get(wheel, "rim_full", "rim") ?? [get(wheel, "rim_width", "width"), "J ×", get(wheel, "rim_diameter", "diameter")].filter(Boolean).join(" ");
                const offset = get(wheel, "rim_offset", "offset");
                const pcd = get(wheel, "bolt_pattern", "pcd", "bolt_pattern_full") ?? get(row, "bolt_pattern", "pcd", "bolt_pattern_full") ?? get(vehicleTechnical, "bolt_pattern", "pcd", "bolt_pattern_full");
                const tyre = get(wheel, "tire_full", "tire", "tyre_full", "tyre");
                return <tr key={`${row._id}-${label}`}>
                  <td><span className={`fitment-type fitment-type--${row._type.toLowerCase()}`}>{row._type === "OE" ? "原厂" : "可选"}</span></td>
                  <td>{label}</td>
                  <td>{format(rim)}</td>
                  <td>{offset == null ? "—" : `ET${format(offset)}`}</td>
                  <td>{format(pcd)}</td>
                  <td>{format(tyre)}</td>
                  <td><button type="button" className="fitment-use-button" onClick={() => choose(row)}>使用这组参数</button></td>
                </tr>;
              });
            })}</tbody>
          </table></div>
          <p className="wheels-fitment__table-note">选择参数后可带入目录筛选。实际适配仍需依据 Euresis 产品经过确认的技术规格进行核验。</p>
        </div>}
      </div>
    </section>
  );
}
