"use client";

import { ESelect, ESelectItem } from "@/src/components/ui/carbon-primitives";

type SelectUpdateEvent = CustomEvent<{ value?: string | number | null }>;
const codes = ["AD","AE","AF","AG","AI","AL","AM","AO","AQ","AR","AS","AT","AU","AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR","GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU","GW","GY","HK","HM","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY","QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY","UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","YE","YT","ZA","ZM","ZW"];
const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const overrides: Record<string, string> = {
  HK: "China, Hong Kong SAR", MO: "China, Macao SAR", TW: "China, Taiwan",
  GB: "United Kingdom", KR: "South Korea", KP: "North Korea", CZ: "Czechia",
  TR: "Türkiye", VA: "Vatican City", PS: "Palestine", BO: "Bolivia",
  BN: "Brunei Darussalam", CV: "Cabo Verde", CI: "Côte d’Ivoire", SZ: "Eswatini",
  FM: "Micronesia", MD: "Moldova", MK: "North Macedonia", TZ: "Tanzania",
  VE: "Venezuela", VN: "Vietnam", RU: "Russia", LA: "Laos", SY: "Syria",
};
const flag = (code: string) => String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));

export function CountryRegionSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="country-region-select">
      <ESelect label="Country / Region" name="country-region" value={value} onChange={(event: SelectUpdateEvent) => onChange(String(event.detail.value ?? ""))}>
        <ESelectItem value="">Select country / region</ESelectItem>
        {codes.map((code) => <ESelectItem key={code} value={code}><span className="country-flag" aria-hidden="true">{flag(code)}</span><span>{overrides[code] ?? displayNames.of(code) ?? code}</span></ESelectItem>)}
      </ESelect>
    </div>
  );
}
