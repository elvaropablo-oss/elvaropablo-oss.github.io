(()=>{
'use strict';
const VERSION='2026-09-12.2';
const SITE=(location.pathname.split('/').filter(Boolean)[0]||'hub').toLowerCase();
const DISCLOSURE='https://elvaropablo-oss.github.io/afiliacion.html';
const CATALOG={
  'calculadora-coche':{label:'CosteCoche',intents:['renting','seguro','mantenimiento','neumaticos','financiacion'],offers:[]},
  'cuanto-material':{label:'CuántoMaterial',intents:['pintura','azulejos','suelo','pladur','mortero','aislamiento','aridos'],offers:[]},
  'horno-exacto':{label:'HornoExacto',intents:['moldes','basculas','termometros','utensilios'],offers:[]},
  'teje-con-medida':{label:'TejeConMedida',intents:['lanas','agujas','ganchillos','accesorios'],offers:[]},
  'imprime-medido':{label:'ImprimeMedido',intents:['papel','etiquetas','reglas','calibradores'],offers:[]},
  'escala-clara':{label:'EscalaClara',intents:['escalimetros','reglas','medicion'],offers:[]},
  'cuelga-medido':{label:'CuelgaMedido',intents:['tacos','ganchos','niveles','fijaciones'],offers:[]},
  'estante-medido':{label:'EstanteMedido',intents:['tableros','escuadras','tornilleria','herramientas'],offers:[]},
  'embala-exacto':{label:'EmbalaExacto',intents:['cajas','relleno','cinta','proteccion'],offers:[]},
  'tierra-exacta':{label:'TierraExacta',intents:['sustratos','macetas','abonos','jardineria'],offers:[]}
};
const overrides=window.HERRAMIENTAS_EXACTAS_AFFILIATE_OVERRIDES||{};
const base=CATALOG[SITE]||{label:SITE,intents:[],offers:[]};
const cfg={...base,...(overrides[SITE]||{}),offers:[...(base.offers||[]),...((overrides[SITE]||{}).offers||[])]};
const path=location.pathname;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=value=>{try{const u=new URL(String(value),location.href);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}};
const matches=offer=>{
  const paths=Array.isArray(offer.paths)?offer.paths:['*'];
  return paths.some(p=>p==='*'||path.includes(p));
};
const eligible=()=>cfg.offers.map(o=>o&&({...o,url:safeUrl(o.url)})).filter(o=>o&&o.approved===true&&o.url&&o.title&&o.id&&o.merchant&&matches(o));
function track(offer){
  const data={site:SITE,merchant:offer.merchant||'',offer_id:offer.id||'',destination:offer.url};
  try{
    if(typeof window.gtag==='function')window.gtag('event','affiliate_click',data);
    else if(typeof window.cmTrack==='function')window.cmTrack('affiliate_click',data);
    else if(window.CosteCocheAnalytics?.track)window.CosteCocheAnalytics.track('affiliate_click',data);
  }catch{}
}
function style(){
  if(document.getElementById('heMonetizationStyles'))return;
  const s=document.createElement('style');s.id='heMonetizationStyles';s.textContent=`
  .he-affiliate{margin:1.1rem 0;padding:1rem;border:1px solid rgba(90,100,94,.22);border-radius:14px;background:rgba(255,255,255,.72)}
  .he-affiliate__head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.5rem;margin-bottom:.7rem}
  .he-affiliate__head h3{font-size:1rem;margin:0}.he-affiliate__disclosure{font-size:.76rem;opacity:.78;margin:0}.he-affiliate__disclosure a{color:inherit}
  .he-affiliate__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.65rem}
  .he-affiliate__item{display:flex;flex-direction:column;gap:.35rem;padding:.8rem;border:1px solid rgba(90,100,94,.17);border-radius:11px;background:#fff;color:inherit;text-decoration:none}
  .he-affiliate__item:hover{text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.06)}
  .he-affiliate__item strong{font-size:.92rem}.he-affiliate__item span{font-size:.82rem;opacity:.82}.he-affiliate__item em{font-style:normal;font-size:.78rem;font-weight:750;margin-top:auto}
  `;document.head.appendChild(s);
}
function target(){
  const selectors=['.result-card:not([hidden])','.result:not([hidden])','[data-result]:not([hidden])','.calculator-result:not([hidden])'];
  for(const sel of selectors){const nodes=[...document.querySelectorAll(sel)].filter(n=>n.offsetParent!==null);if(nodes.length)return nodes[nodes.length-1]}
  return document.querySelector('main');
}
function render(){
  const offers=eligible();
  document.querySelectorAll('.he-affiliate[data-he-generated="1"]').forEach(n=>n.remove());
  if(!offers.length)return;
  const anchor=target();if(!anchor)return;
  style();
  const section=document.createElement('aside');section.className='he-affiliate';section.dataset.heGenerated='1';section.setAttribute('aria-label','Recomendaciones comerciales');
  section.innerHTML=`<div class="he-affiliate__head"><h3>${esc(cfg.heading||'Opciones relacionadas')}</h3><p class="he-affiliate__disclosure">Algunos enlaces son de afiliado: podemos recibir una comisión sin coste extra para ti. <a href="${DISCLOSURE}" target="_blank" rel="noopener">Cómo funciona</a>.</p></div><div class="he-affiliate__grid">${offers.map(o=>`<a class="he-affiliate__item" data-affiliate-link="1" data-offer-id="${esc(o.id)}" data-merchant="${esc(o.merchant)}" href="${esc(o.url)}" target="_blank" rel="sponsored noopener"><strong>${esc(o.title)}</strong>${o.description?`<span>${esc(o.description)}</span>`:''}<em>${esc(o.cta||'Ver opción')} →</em></a>`).join('')}</div>`;
  section.querySelectorAll('[data-affiliate-link]').forEach((a,i)=>a.addEventListener('click',()=>track(offers[i])));
  anchor.insertAdjacentElement('afterend',section);
}
function refresh(){requestAnimationFrame(()=>requestAnimationFrame(render))}
window.HerramientasExactasMonetization={version:VERSION,site:SITE,label:cfg.label,intents:[...(cfg.intents||[])],get offers(){return eligible()},refresh};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh,{once:true});else refresh();
document.addEventListener('submit',()=>setTimeout(refresh,80),true);
document.addEventListener('click',e=>{if(e.target.closest?.('button,[role="button"]'))setTimeout(refresh,120)},true);
})();
