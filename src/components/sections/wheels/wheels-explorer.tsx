"use client";

import { useMemo, useState } from "react";
import type { WheelProduct, WheelCollection } from "@/src/data/wheels";

type Props = { products: WheelProduct[]; collections: {id: WheelCollection; subtitle: string}[] };

export default function WheelsExplorer({products, collections}: Props) {
  const [query,setQuery]=useState("");
  const [collection,setCollection]=useState<"ALL"|WheelCollection>("ALL");
  const [construction,setConstruction]=useState<"ALL"|"FORGED"|"CAST">("ALL");
  const [sort,setSort]=useState("featured");
  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase();
    const list=products.filter(p=>(collection==="ALL"||p.collection===collection)&&(construction==="ALL"||p.manufacturing===construction)&&(!q||[p.model,p.collection,p.code,p.design,p.description].join(" ").toLowerCase().includes(q)));
    if(sort==="name") list.sort((a,b)=>a.model.localeCompare(b.model));
    if(sort==="forged") list.sort((a,b)=>Number(b.manufacturing==="FORGED")-Number(a.manufacturing==="FORGED"));
    return list;
  },[products,collection,construction,query,sort]);
  return <div className="wheels-explorer">
    <div className="catalog-tools">
      <label className="catalog-search"><span>SEARCH THE COLLECTION</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search model, design or code" /></label>
      <label className="catalog-sort"><span>SORT BY</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="name">Model name</option><option value="forged">Forged first</option></select></label>
    </div>
    <div className="catalog-filters" aria-label="Filter by construction">
      {(["ALL","FORGED","CAST"] as const).map(value=><button key={value} type="button" className={construction===value?"filter-chip is-active":"filter-chip"} aria-pressed={construction===value} onClick={()=>setConstruction(value)}>{value==="ALL"?"ALL CONSTRUCTION":value}</button>)}
    </div>
    <nav className="catalog-collections" aria-label="Filter by collection">
      <button type="button" className={collection==="ALL"?"collection-filter is-active":"collection-filter"} onClick={()=>setCollection("ALL")}>ALL COLLECTIONS</button>
      {collections.map(item=><button type="button" key={item.id} className={collection===item.id?"collection-filter is-active":"collection-filter"} onClick={()=>setCollection(item.id)}><span>{item.id}</span><small>{item.subtitle}</small></button>)}
    </nav>
    <div className="catalog-results"><span>{visible.length} MODELS</span><span>ILLUSTRATIVE PRODUCT DATA</span></div>
    {visible.length ? <div className="product-grid">
      {visible.map((product,index)=><a className="product-card" href={"/wheels/"+product.slug} key={product.slug}>
        <div className="product-image"><img src={product.image} alt={product.imageAlt} loading="lazy" /><span className="product-number">{String(index+1).padStart(2,"0")}</span><span className="product-open">↗</span><span className="product-construction">{product.manufacturing}</span></div>
        <div className="product-meta"><span>{product.collection} SERIES</span><span>{product.code}</span></div>
        <div className="product-title"><h3>{product.model}</h3><span>{product.diameterRange}</span></div>
        <p>{product.description}</p>
      </a>)}
    </div> : <div className="catalog-empty"><span>NO MATCHING WHEELS</span><p>Try another model name or clear one of the filters.</p><button type="button" className="button-outlined" onClick={()=>{setQuery("");setCollection("ALL");setConstruction("ALL");}}>Clear filters ↗</button></div>}
  </div>;
}
