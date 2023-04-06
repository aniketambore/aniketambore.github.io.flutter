'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "google345a38fff57ca027.html": "45ea3e98e88e63b7cb4cfe81f02dc544",
"favicon.ico": "38ac52426e6d5b4d86efeaa93f57696e",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e",
"index.html": "6153833eb24b9c3719c45e9e23600fbe",
"/": "6153833eb24b9c3719c45e9e23600fbe",
"_config.yml": "d2d83a0f56c80b583dbdfafbe0abc79c",
"google4yxKQfQHHtA3gipnyOskiTB9urRhy-3b2O4nRy7DJUE.html": "60ee6955133fc436d99c96413e99ea7e",
"lnurl-pay.js": "f44ba792ebd912214859db7aa9d32e63",
"main.dart.js": "b4fb8c01bab7e6ccba8ec93a563937a7",
"icons/bitcoin_blue.png": "e852c3335d68a4a197458bacd74aeeee",
"icons/maskable_icon_x96.png": "3986057223f20ea4506a87a9e7d4b401",
"icons/maskable_icon_x512.png": "f175f0d6e0173f761174e5078371315f",
"icons/maskable_icon_x48.png": "680740c37a35af655330bb9deb551541",
"icons/maskable_icon_x192.png": "e402f0e0c5aac599aefb4566d39fd656",
"icons/maskable_icon_x384.png": "038b9a22d90464c152b5fc9b7c1f1bc0",
"icons/maskable_icon_x128.png": "113457169b7c126e1eb3cf1640dd75a2",
"icons/maskable_icon_x72.png": "23dd3abaecc569cbd1f5d2ebfe4c3d67",
"icons/Icon-192.png": "864a43ce34570df8ea0283ab29b86793",
"manifest.json": "fe35e2451ea68fff6dede0e85e02f72c",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"favicon.png": "b7b5c8f63b02cd211d272f17ca1af722",
"app.js": "175386dad7045d1ee2405498bb5e8421",
"version.json": "2b416f3c1bbc56e00c93018352894386",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/NOTICES": "1cf7e8506b15fe62bb6b5a55acc253a7",
"assets/AssetManifest.json": "9915d73e2faab7ab412957e951bb8de9",
"assets/identity.json": "3f049f00eb4bb3418c40b3aff1285967",
"assets/assets/twitter.svg": "e23ffd25eb3f56b03646827b30dca9a2",
"assets/assets/satoshi-v1.svg": "5b2ca264c16d89f2f401404e442cf9a3",
"assets/assets/bitcoin-circle.svg": "7d34f1d005c993a9b85d09a45c75bd1a",
"assets/assets/linkedin.svg": "a1236bde0e94da26c091b1c7bb6dcc74",
"assets/assets/github.svg": "69dcc145b4ca5b73b5ad3afd1c22ce18",
"assets/assets/web.svg": "50417102a643e5b08de6aed94a6a45f6",
"assets/assets/nostr.svg": "feb7969ebd3c2d84479dd48695050e33",
".well-known/nostr.json": "d5edbb4d95b075673752de348b2abad6"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
