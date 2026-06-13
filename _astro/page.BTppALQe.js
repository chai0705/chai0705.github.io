const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/mermaid.core.CLt9VHPa.js","_astro/preload-helper.BlTxHScW.js","_astro/_commonjsHelpers.gnU0ypJ3.js","_astro/transform.BY9u9bHY.js"])))=>i.map(i=>d[i]);
import{_ as b}from"./preload-helper.BlTxHScW.js";import{i as p}from"./index.2TnVP-z6.js";const r=(...e)=>console.log("[astro-mermaid]",...e),l=(...e)=>console.error("[astro-mermaid]",...e),u=()=>document.querySelectorAll("pre.mermaid").length>0;let d=null;async function f(){return d||(r("Loading mermaid.js..."),d=b(()=>import("./mermaid.core.CLt9VHPa.js").then(e=>e.aU),__vite__mapDeps([0,1,2,3])).then(async({default:e})=>{const a=[];if(a&&a.length>0){r("Registering",a.length,"icon packs");const i=a.map(t=>({name:t.name,loader:new Function("return "+t.loader)()}));await e.registerIconPacks(i)}return e}).catch(e=>{throw l("Failed to load mermaid:",e),d=null,e}),d)}const s={startOnLoad:!1,theme:"default"},k={light:"default",dark:"dark"};async function c(){r("Initializing mermaid diagrams...");const e=document.querySelectorAll("pre.mermaid");if(r("Found",e.length,"mermaid diagrams"),e.length===0)return;const a=await f();let i=s.theme;{const t=document.documentElement.getAttribute("data-theme"),m=document.body.getAttribute("data-theme");i=k[t||m]||s.theme,r("Using theme:",i,"from",t?"html":"body")}a.initialize({...s,theme:i,gitGraph:{mainBranchName:"main",showCommitLabel:!0,showBranches:!0,rotateCommitLabel:!0}});for(const t of e){if(t.hasAttribute("data-processed"))continue;t.hasAttribute("data-diagram")||t.setAttribute("data-diagram",t.textContent||"");const m=t.getAttribute("data-diagram")||"",o="mermaid-"+Math.random().toString(36).slice(2,11);r("Rendering diagram:",o);try{const n=document.getElementById(o);n&&n.remove();const{svg:h}=await a.render(o,m);t.innerHTML=h,t.setAttribute("data-processed","true"),r("Successfully rendered diagram:",o)}catch(n){l("Mermaid rendering error for diagram:",o,n),t.innerHTML=`<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;">
        <strong>Error rendering diagram:</strong><br/>
        ${n.message||"Unknown error"}
      </div>`,t.setAttribute("data-processed","true")}}}u()?(r("Mermaid diagrams detected on initial load"),c()):r("No mermaid diagrams found on initial load");{const e=new MutationObserver(a=>{for(const i of a)i.type==="attributes"&&i.attributeName==="data-theme"&&(document.querySelectorAll("pre.mermaid[data-processed]").forEach(t=>{t.removeAttribute("data-processed")}),c())});e.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),e.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]})}document.addEventListener("astro:after-swap",()=>{r("View transition detected"),u()&&c()});const g=document.createElement("style");g.textContent=`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }
          `;document.head.appendChild(g);p();
