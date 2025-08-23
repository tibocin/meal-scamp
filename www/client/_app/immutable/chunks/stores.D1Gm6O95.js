import{w as S}from"./index.zANXAtWU.js";var d={local:{},session:{}};function h(e){return e==="local"?localStorage:sessionStorage}function o(e,i,m){return console.warn(`writable() has been deprecated. Please use persisted() instead.

change:

import { writable } from 'svelte-local-storage-store'

to:

import { persisted } from 'svelte-local-storage-store'`),I(e,i)}function I(e,i,m){var g,w;const c=(g=void 0)!=null?g:JSON,s=(w=void 0)!=null?w:"local",f=typeof window<"u"&&typeof document<"u",r=f?h(s):null;function v(a,u){r==null||r.setItem(a,c.stringify(u))}if(!d[s][e]){const a=S(i,t=>{const l=r==null?void 0:r.getItem(e);if(l&&t(c.parse(l)),f&&s=="local"){const n=p=>{p.key===e&&t(p.newValue?c.parse(p.newValue):null)};return window.addEventListener("storage",n),()=>window.removeEventListener("storage",n)}}),{subscribe:u,set:b}=a;d[s][e]={set(t){v(e,t),b(t)},update(t){return a.update(l=>{const n=t(l);return v(e,n),n})},subscribe:u}}return d[s][e]}const L=o("meals-v1",[]),O=o("plan-v1",{}),T=o("punches-v1",{}),V=o("workouts-v1",{}),_=o("goal-v1",{start:175,target:150,current:175,startedAt:new Date().toISOString()}),j=o("pushover-v1",{userKey:"",appToken:"",enabled:!1});export{j as a,T as b,_ as g,L as m,O as p,V as w};
