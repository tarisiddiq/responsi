(function() {
  'use strict';

  var CACHE_NAME = 'kain-tenun-sasak';
	var urlsToCache = [
	'.',
		  'assets/css/style.css',
		  'assets/css/bootstrap.min.css',
		  'assets/css/bootstrap-theme.min.css',
		  'assets/css/plugins.css',
		  'assets/css/lora-web-font.css',
		  'assets/css/opensans-web-font.css',
		  'assets/css/magnific-popup.css',
		  'assets/css/responsive.css',
		  'assets/images/ficture/icon1.jpg',
		  'assets/images/ficture/icon1.jpg',
		  'assets/images/portfolio/keker.jpg',
		  
		  'index.html',
		  'assets/page/offline.html',
		  'assets/page/404.html'
	];
	self.addEventListener('install', function(event) {
	event.waitUntil(
	caches.open(CACHE_NAME)
	.then(function(cache) {
	return cache.addAll(urlsToCache);
	})
	);
	});


	self.addEventListener('fetch', function(event) {
	event.respondWith(
	caches.match(event.request)
	.then(function(response) {
	return response || fetchAndCache(event.request);
	})
	);
	});
	function fetchAndCache(url) {
	return fetch(url)
	.then(function(response) {
	// Check if we received a valid response
	if (!response.ok) {
	throw Error(response.statusText);
	}
	return caches.open(CACHE_NAME)
	.then(function(cache) {
	cache.put(url, response.clone());
	return response;
	});
	})
	.catch(function(error) {
	console.log('Request failed:', error);
	// You could return a custom offline 404 page here
	});
	}

