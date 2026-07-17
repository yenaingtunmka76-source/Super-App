const CACHE="myitkyina-guide-v6";
const IMAGE_CACHE="myitkyina-images-v1";
const CORE=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png"];
const LANDMARK_IMAGES=[
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Myit_Sone.jpg/1280px-Myit_Sone.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Manaw_Park_Myitkyina.jpg/1280px-Manaw_Park_Myitkyina.jpg",
  "https://kachinnews.com/wp-content/uploads/2019/08/Irrawaddy-bridge-at-Myitkyina.jpg"
];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener("activate",event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE&&key!==IMAGE_CACHE).map(key=>caches.delete(key)))),
  caches.open(IMAGE_CACHE).then(cache=>Promise.allSettled(LANDMARK_IMAGES.map(url=>fetch(url,{mode:"no-cors"}).then(response=>cache.put(url,response)))))
]).then(()=>self.clients.claim())));
self.addEventListener("message",event=>{if(event.data&&event.data.type==="SKIP_WAITING")self.skipWaiting()});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.destination==="image"){
    event.respondWith(caches.open(IMAGE_CACHE).then(cache=>cache.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{cache.put(event.request,response.clone());return response}).catch(()=>caches.match("./icon-192.png")))));
    return;
  }
  if(new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put("./index.html",copy));return response}).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response})));
});
