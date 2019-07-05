var idbApp = (function() {
"use strict";

if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  var dbPromise = idb.open('kain-sukarare', 4, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
        // a placeholder case so that the switch block will
        // execute when the database is first created
        // (oldVersion is 0)
      case 1:
        console.log('Creating the products object store');
        upgradeDb.createObjectStore('products', {keyPath: 'id'});
      case 2:
        console.log('Creating a name index');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('name', 'name', {unique: true});
      case 3:
        console.log('Creating description and price indexes');
        var store = upgradeDb.transaction.objectStore('products');
        store.createIndex('price', 'price');
        store.createIndex('description', 'description');

      // TODO 5.1 - create an 'orders' object store

    }
  });

  function addProducts() {

    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readwrite');
      var store = tx.objectStore('products');
      var items = [
        {
          name: 'motif-keker-1',
          id: 'mo-ke-1',
          price: 300.000,
          motive: 'keker',
          description: 'motif keker urutan 1',
          quantity: 3
        },
        {
          name: 'motif-keker-2',
          id: 'mo-ke-2',
          price: 400.000,
          motive: 'keker',
          description: 'motif keker urutan 2',
          quantity: 7
        },
        {
          name: 'motif-keker-3',
          id: 'mo-ke-3',
          price: 350.000,
          motive: 'keker',
          description: 'motif keker urutan 3',
          quantity: 3
        },
        {
          name: 'motif-lepang-1',
          id: 'mo-le-1',
          price: 380.000,
          motive: 'lepang',
          description: 'motif lepang urutan 1',
          quantity: 3
        },
        {
          name: 'motif-lepang-2',
          id: 'mo-le-2',
          price: 450.000,
          motive: 'lepang',
          description: 'motif lepang urutan 2',
          quantity: 7
        },
        {
          name: 'motif-lepang-3',
          id: 'mo-le-3',
          price: 350.000,
          motive: 'lepang',
          description: 'motif lepang urutan 3',
          quantity: 3
        },
        {
          name: 'motif-nanas-1',
          id: 'mo-na-1',
          price: 260.000,
          motive: 'nanas',
          description: 'motif nanas urutan 1',
          quantity: 3
        },
        {
          name: 'motif-nanas-2',
          id: 'mo-na-2',
          price: 280.000,
          motive: 'nanas',
          description: 'motif nanas urutan 2',
          quantity: 7
        },
        {
          name: 'motif-nanas-3',
          id: 'mo-na-3',
          price: 300.000,
          motive: 'nanas',
          description: 'motif nanas urutan 3',
          quantity: 3
        },
        {
          name: 'motif-subahanale-1',
          id: 'mo-su-1',
          price: 400.000,
          motive: 'subahanale',
          description: 'motif subahanale urutan 1',
          quantity: 3
        },
        {
          name: 'motif-subahanale-2',
          id: 'mo-su-2',
          price: 450.000,
          motive: 'subahanale',
          description: 'motif subahanale urutan 2',
          quantity: 7
        },
        {
          name: 'motif-subahanale-3',
          id: 'mo-su-3',
          price: 500.000,
          motive: 'subahanale',
          description: 'motif subahanale urutan 3',
          quantity: 3
        }
      ];
      return Promise.all(items.map(function(item) {
          console.log('Adding item: ', item);
          return store.add(item);
        })
      ).catch(function(e) {
        tx.abort();
        console.log(e);
      }).then(function() {
        console.log('All items added successfully!');
      });
    });

  }

  function getByName(key) {
    return dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('name');
      return index.get(key);
    });
  }

  function displayByName() {
    var key = document.getElementById('name').value;
    if (key === '') {return;}
    var s = '';
    getByName(key).then(function(object) {
      if (!object) {return;}

      s += '<h2>' + object.name + '</h2><p>';
      for (var field in object) {
        s += field + ' = ' + object[field] + '<br/>';
      }
      s += '</p>';

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByPrice() {
    var lower = document.getElementById('priceLower').value;
    var upper = document.getElementById('priceUpper').value;
    var lowerNum = Number(document.getElementById('priceLower').value);
    var upperNum = Number(document.getElementById('priceUpper').value);

    if (lower === '' && upper === '') {return;}
    var range;
    if (lower !== '' && upper !== '') {
      range = IDBKeyRange.bound(lowerNum, upperNum);
    } else if (lower === '') {
      range = IDBKeyRange.upperBound(upperNum);
    } else {
      range = IDBKeyRange.lowerBound(lowerNum);
    }
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('price');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function getByDesc() {
    var key = document.getElementById('desc').value;
    if (key === '') {return;}
    var range = IDBKeyRange.only(key);
    var s = '';
    dbPromise.then(function(db) {
      var tx = db.transaction('products', 'readonly');
      var store = tx.objectStore('products');
      var index = store.index('description');
      return index.openCursor(range);
    }).then(function showRange(cursor) {
      if (!cursor) {return;}
      console.log('Cursored at:', cursor.value.name);
      s += '<h2>Price - ' + cursor.value.price + '</h2><p>';
      for (var field in cursor.value) {
        s += field + '=' + cursor.value[field] + '<br/>';
      }
      s += '</p>';
      return cursor.continue().then(showRange);
    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('results').innerHTML = s;
    });
  }

  function addOrders() {

    // TODO 5.2 - add items to the 'orders' object store

  }

  function showOrders() {
    var s = '';
    dbPromise.then(function(db) {

      // TODO 5.3 - use a cursor to display the orders on the page

    }).then(function() {
      if (s === '') {s = '<p>No results.</p>';}
      document.getElementById('orders').innerHTML = s;
    });
  }

  function getOrders() {

    // TODO 5.4 - get all objects from 'orders' object store

  }

  function fulfillOrders() {
    getOrders().then(function(orders) {
      return processOrders(orders);
    }).then(function(updatedProducts) {
      updateProductsStore(updatedProducts);
    });
  }

  function processOrders(orders) {

    // TODO 5.5 - get items in the 'products' store matching the orders

  }

  function decrementQuantity(product, order) {

    // TODO 5.6 - check the quantity of remaining products

  }

  function updateProductsStore(products) {
    dbPromise.then(function(db) {

      // TODO 5.7 - update the items in the 'products' object store

    }).then(function() {
      console.log('Orders processed successfully!');
      document.getElementById('receipt').innerHTML =
      '<h3>Order processed successfully!</h3>';
    });
  }

  return {
    dbPromise: (dbPromise),
    addProducts: (addProducts),
    getByName: (getByName),
    displayByName: (displayByName),
    getByPrice: (getByPrice),
    getByDesc: (getByDesc),
    addOrders: (addOrders),
    showOrders: (showOrders),
    getOrders: (getOrders),
    fulfillOrders: (fulfillOrders),
    processOrders: (processOrders),
    decrementQuantity: (decrementQuantity),
    updateProductsStore: (updateProductsStore)
  };
})();



jQuery(document).ready(function ($) {
	
	
	/*---------------------------------------------*
     * Preloader
     ---------------------------------------------*/
	 
	$(window).load(function () {
		$(".loaded").fadeOut();
		$(".preloader").delay(1000).fadeOut("slow");
	});
	
	
    /*---------------------------------------------*
     * Mobile menu
     ---------------------------------------------*/
    $('#navbar-collapse').find('a[href*=#]:not([href=#])').click(function () {
        if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
                $('html,body').animate({
                    scrollTop: (target.offset().top - 40)
                }, 1000);
                if ($('.navbar-toggle').css('display') != 'none') {
                    $(this).parents('.container').find(".navbar-toggle").trigger("click");
                }
                return false;
            }
        }
    });

    /*---------------------------------------------*
     * Isotop for portfolio
     ---------------------------------------------*/

    $(function () {
        // init Isotope
        var $grid = $('.portfolio-one').isotope({
            itemSelector: '.portfolio-item',
            layoutMode: 'fitRows'
        });
        // filter functions
        var filterFns = {
            // show if number is greater than 50
            numberGreaterThan50: function () {
                var number = $(this).find('.number').text();
                return parseInt(number, 10) > 50;
            },
            // show if name ends with -ium
            ium: function () {
                var name = $(this).find('.name').text();
                return name.match(/ium$/);
            }
        };
        // bind filter button click
        $('.filters-button-group').on('click', 'button', function () {
            var filterValue = $(this).attr('data-filter');
            // use filterFn if matches value
            filterValue = filterFns[ filterValue ] || filterValue;
            $grid.isotope({filter: filterValue});
        });
        // change is-checked class on buttons
        $('.button-group').each(function (i, buttonGroup) {
            var $buttonGroup = $(buttonGroup);
            $buttonGroup.on('click', 'button', function () {
                $buttonGroup.find('.is-checked').removeClass('is-checked');
                $(this).addClass('is-checked');
            });
        });

    });

    /*---------------------------------------------*
     * Scroll Up
     ---------------------------------------------*/
    $(window).scroll(function () {
        if ($(this).scrollTop() > 600) {
            $('.scrollup').fadeIn('slow');
        } else {
            $('.scrollup').fadeOut('slow');
        }
    });

    $('.scrollup').click(function () {
        $("html, body").animate({scrollTop: 0}, 1000);
        return false;
    });

    /*---------------------------------------------*
     * Menu Background Change
     ---------------------------------------------*/

    var windowWidth = $(window).width();
    if (windowWidth > 757) {



        $(window).scroll(function () {
            if ($(this).scrollTop() > 300) {
                $('.navbar').fadeIn(300);
                $('.navbar').addClass('menu-bg');

            } else {

                $('.navbar').removeClass('menu-bg');
            }
        });

    }
    $('#bs-example-navbar-collapse-1').localScroll();




    /*---------------------------------------------*
     * STICKY scroll
     ---------------------------------------------*/

    $.localScroll();
    
    /*---------------------------------------------*
     * Gallery Pop Up Animation
     ---------------------------------------------*/

    $('.portfolio-img').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });



    /*---------------------------------------------*
     * Counter 
     ---------------------------------------------*/

//    $('.statistic-counter').counterUp({
//        delay: 10,
//        time: 2000
//    });




    /*---------------------------------------------*
     * WOW
     ---------------------------------------------*/

//        var wow = new WOW({
//            mobile: false // trigger animations on mobile devices (default is true)
//        });
//        wow.init();


    /* ---------------------------------------------------------------------
     Carousel
     ---------------------------------------------------------------------= */

    $('.brand-category').owlCarousel({
        responsiveClass: true,
        autoplay: false,
        items: 1,
        loop: true,
        dots: true,
        autoplayHoverPause: true,
        responsive: {
            // breakpoint from 0 up
            // breakpoint from 480 up
            0: {
                items: 1
            },
            480: {
                items: 2
            },
            // breakpoint from 768 up
            768: {
                items: 1
            },
            980: {
                items: 1
            }
        }

    });


    //End
});
