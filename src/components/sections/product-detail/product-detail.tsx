"use client";

import { useMemo, useState } from "react";
import type { WheelProduct } from "@/src/data/wheels";

export default function ProductDetail({product}:{product:WheelProduct}) {
  const images=useMemo(()=>Array.from(new Set([...(product.galleryImages??[]),product.image])),[product]);
  const [activeImage,setActiveImage]=useState(0);
  const [activeVariant,setActiveVariant]=useState(product.variants?.[0]?.id??"");
  const selected=product.variants?.find(v=>v.id===activeVariant);
  return <main className="detail-page" id="main">
    <a className="back-link" href="/wheels">← All wheels</a>
    <div className="detail-layout">
      <section className="detail-gallery" aria-label="Wheel image gallery">
        <div className="detail-image"><img src={images[activeImage]} alt={product.imageAlt} /><span>REFERENCE IMAGE / SAMPLE</span><span className="gallery-count">{String(activeImage+1).padStart(2,"0")} / {String(images.length).padStart(2,"0")}</span></div>
        {images.length>1 ? <div className="gallery-thumbnails">{images.map((src,index)=><button type="button" key={src} className={activeImage===index?"gallery-thumb is-active":"gallery-thumb"} onClick={()=>setActiveImage(index)} aria-label={"View image "+(index+1)} aria-pressed={activeImage===index}><img src={src} alt="" /></button>)}</div> : <p className="gallery-note">Additional product angles will be added when verified photography is available.</p>}
      </section>
      <section className="detail-copy">
        <span className="eyebrow">{product.collection} COLLECTION / {product.manufacturing}</span>
        <h1>{product.model}</h1>
        <p className="detail-description">{product.description}</p>
        <div className="detail-specs">
          <div><span>DESIGN</span><strong>{product.design}</strong></div>
          <div><span>DIAMETER RANGE</span><strong>{product.diameterRange}</strong></div>
          <div><span>FINISH OPTIONS</span><strong>{product.finishCount} concepts</strong></div>
          <div><span>PRODUCT CODE</span><strong>{product.code}</strong></div>
        </div>
        {product.variants?.length ? <div className="variant-selector"><span className="eyebrow">SELECT CONFIGURATION</span><div className="variant-options">{product.variants.map(v=><button type="button" key={v.id} className={activeVariant===v.id?"variant-option is-active":"variant-option"} onClick={()=>setActiveVariant(v.id)} aria-pressed={activeVariant===v.id}>{v.label??v.id}</button>)}</div>{selected&&<p className="variant-summary">{[selected.diameterInches?selected.diameterInches+' in':null,selected.widthInches?selected.widthInches+'J':null,selected.pcd,selected.offsetMm!==undefined?'ET '+selected.offsetMm:null,selected.finish].filter(Boolean).join(' · ')||"Configuration details to be confirmed"}</p>}</div> : <div className="variant-pending"><span className="eyebrow">CONFIGURATION</span><p>Exact widths, offsets, PCD and finishes are not yet published for this sample product. Request a confirmed specification before ordering.</p></div>}
        <div className="detail-actions"><a className="button-filled detail-action" href={"/contact?product="+product.slug}>Enquire about this wheel <span>↗</span></a><a className="button-outlined" href={"/fitment?product="+product.slug}>Check vehicle fitment <span>↗</span></a></div>
        <p className="detail-disclaimer">Illustrative sample record, not a certified production specification. Vehicle compatibility must be confirmed against the exact wheel configuration.</p>
      </section>
    </div>
  </main>;
}
