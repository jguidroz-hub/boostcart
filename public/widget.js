/**
 * BoostCart — Storefront Upsell Widget
 * 
 * Self-contained vanilla JS widget injected via BigCommerce Scripts API.
 * Renders post-purchase upsell offers on the order confirmation page.
 * 
 * Size target: < 50KB uncompressed, < 15KB gzipped
 * Dependencies: NONE (vanilla JS + scoped CSS)
 */

(function() {
  'use strict';

  // ──── Configuration ────
  var BOOSTCART_API = '{{BOOSTCART_API_URL}}'; // Replaced at build/serve time
  var STORE_HASH = '';
  var ORDER_ID = '';
  var WIDGET_ID = 'boostcart-upsell-widget';

  // ──── Initialization ────
  function init() {
    // Only run on order confirmation pages
    if (!isOrderConfirmationPage()) return;

    // Extract order ID from the page
    ORDER_ID = getOrderId();
    if (!ORDER_ID) return;

    // Extract store hash from the script src or page context
    STORE_HASH = getStoreHash();
    if (!STORE_HASH) return;

    // Resolve API URL from the script tag
    resolveApiUrl();

    // Fetch and render the upsell offer
    fetchOffer();
  }

  function isOrderConfirmationPage() {
    var path = window.location.pathname.toLowerCase();
    return (
      path.indexOf('/order-confirmation') !== -1 ||
      path.indexOf('/checkout/order-confirmation') !== -1 ||
      path.indexOf('/finishorder') !== -1
    );
  }

  function getOrderId() {
    // Strategy 1: Parse from URL path
    // BC pattern: /checkout/order-confirmation/{orderId}
    var pathParts = window.location.pathname.split('/');
    for (var i = pathParts.length - 1; i >= 0; i--) {
      if (pathParts[i] && !isNaN(parseInt(pathParts[i]))) {
        return pathParts[i];
      }
    }

    // Strategy 2: Parse from URL search params
    var urlParams = new URLSearchParams(window.location.search);
    var orderParam = urlParams.get('order_id') || urlParams.get('orderId');
    if (orderParam) return orderParam;

    // Strategy 3: Look for order number in the DOM
    var orderEl = document.querySelector(
      '[data-test="order-confirmation-order-number-text"],' +
      '.orderConfirmation-section .order-number,' +
      '#checkout-order-confirmation .orderConfirmation'
    );
    if (orderEl) {
      var match = orderEl.textContent.match(/(\d+)/);
      if (match) return match[1];
    }

    return null;
  }

  function getStoreHash() {
    // Strategy 1: From script data attribute
    var scripts = document.querySelectorAll('script[src*="widget.js"]');
    for (var i = 0; i < scripts.length; i++) {
      var hash = scripts[i].getAttribute('data-store-hash');
      if (hash) return hash;
    }

    // Strategy 2: From page meta or BC context
    if (window.BCData && window.BCData.store_hash) {
      return window.BCData.store_hash;
    }

    // Strategy 3: Parse from the store's canonical URL
    var canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      var href = canonicalLink.getAttribute('href');
      var match = href && href.match(/store-([a-z0-9]+)\./);
      if (match) return match[1];
    }

    // Strategy 4: From the page's script tags that reference the BC API
    var allScripts = document.querySelectorAll('script');
    for (var j = 0; j < allScripts.length; j++) {
      var src = allScripts[j].getAttribute('src') || '';
      var storeMatch = src.match(/stores\/([a-z0-9]+)/);
      if (storeMatch) return storeMatch[1];
    }

    // Strategy 5: From cookies
    try {
      var cookies = document.cookie.split(';');
      for (var k = 0; k < cookies.length; k++) {
        var c = cookies[k].trim();
        if (c.indexOf('STORE_HASH=') === 0) {
          return c.substring('STORE_HASH='.length);
        }
      }
    } catch(e) { /* ignore */ }

    return null;
  }

  function resolveApiUrl() {
    if (BOOSTCART_API && BOOSTCART_API.indexOf('{{') === -1) return;

    // Derive API URL from the widget script src
    var scripts = document.querySelectorAll('script[src*="widget.js"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      if (src) {
        // Extract base URL from script src
        var url = new URL(src);
        BOOSTCART_API = url.origin;
        return;
      }
    }

    // Fallback
    BOOSTCART_API = 'https://app.boostcart.io';
  }

  // ──── API Calls ────
  function fetchOffer() {
    var url = BOOSTCART_API + '/api/widget/offer?storeHash=' + encodeURIComponent(STORE_HASH) + '&orderId=' + encodeURIComponent(ORDER_ID);

    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.data) {
          renderWidget(data.data);
          trackEvent(data.data.offerId, 'shown');
        }
      })
      .catch(function(err) {
        console.warn('[BoostCart] Failed to load offer:', err);
      });
  }

  function trackEvent(offerId, action) {
    fetch(BOOSTCART_API + '/api/widget/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeHash: STORE_HASH,
        offerId: offerId,
        orderId: ORDER_ID,
        action: action,
      }),
    }).catch(function() { /* silent fail */ });
  }

  function acceptOffer(offerId) {
    return fetch(BOOSTCART_API + '/api/widget/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeHash: STORE_HASH,
        offerId: offerId,
        orderId: ORDER_ID,
      }),
    })
    .then(function(res) { return res.json(); });
  }

  // ──── Rendering ────
  function renderWidget(offer) {
    // Don't render twice
    if (document.getElementById(WIDGET_ID)) return;

    // Inject scoped CSS
    injectStyles();

    // Create widget container
    var container = document.createElement('div');
    container.id = WIDGET_ID;
    container.className = 'bc-upsell';
    container.setAttribute('role', 'complementary');
    container.setAttribute('aria-label', 'Special offer for you');

    var product = offer.product || {};
    var hasDiscount = offer.discountType && offer.discountValue;
    var savings = '';
    if (hasDiscount) {
      if (offer.discountType === 'percentage') {
        savings = offer.discountValue + '% OFF';
      } else {
        savings = '$' + offer.discountValue.toFixed(2) + ' OFF';
      }
    }

    var html = '';
    html += '<div class="bc-upsell__card">';
    
    // Close button
    html += '<button class="bc-upsell__close" aria-label="Close offer" data-action="close">&times;</button>';

    // Badge
    if (hasDiscount) {
      html += '<div class="bc-upsell__badge">' + escapeHtml(savings) + '</div>';
    }

    // Header
    html += '<div class="bc-upsell__header">';
    html += '<h2 class="bc-upsell__title">' + escapeHtml(offer.title) + '</h2>';
    if (offer.description) {
      html += '<p class="bc-upsell__desc">' + escapeHtml(offer.description) + '</p>';
    }
    html += '</div>';

    // Product
    html += '<div class="bc-upsell__product">';
    if (product.image) {
      html += '<div class="bc-upsell__image-wrap">';
      html += '<img class="bc-upsell__image" src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.name || '') + '" loading="lazy" />';
      html += '</div>';
    }
    html += '<div class="bc-upsell__details">';
    if (product.name) {
      html += '<h3 class="bc-upsell__product-name">' + escapeHtml(product.name) + '</h3>';
    }
    if (product.description) {
      html += '<p class="bc-upsell__product-desc">' + escapeHtml(product.description) + '</p>';
    }
    // Pricing
    html += '<div class="bc-upsell__pricing">';
    if (hasDiscount && product.originalPrice && product.originalPrice !== product.finalPrice) {
      html += '<span class="bc-upsell__price-original">$' + product.originalPrice.toFixed(2) + '</span>';
    }
    if (product.finalPrice !== undefined) {
      html += '<span class="bc-upsell__price-final">$' + product.finalPrice.toFixed(2) + '</span>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    // Timer
    if (offer.showTimer) {
      html += '<div class="bc-upsell__timer" data-seconds="' + offer.timerSeconds + '">';
      html += '<span class="bc-upsell__timer-icon">⏱</span>';
      html += '<span class="bc-upsell__timer-text">Offer expires in </span>';
      html += '<span class="bc-upsell__timer-value">' + formatTime(offer.timerSeconds) + '</span>';
      html += '</div>';
    }

    // Actions
    html += '<div class="bc-upsell__actions">';
    html += '<button class="bc-upsell__cta" data-action="accept" data-offer-id="' + offer.offerId + '">';
    html += escapeHtml(offer.ctaText || 'Add to Order');
    html += '</button>';
    html += '<button class="bc-upsell__decline" data-action="decline" data-offer-id="' + offer.offerId + '">';
    html += escapeHtml(offer.declineText || 'No thanks');
    html += '</button>';
    html += '</div>';

    // Security note
    html += '<p class="bc-upsell__secure">🔒 Secure one-click checkout</p>';

    html += '</div>';

    container.innerHTML = html;

    // Insert after the order confirmation content
    var orderConfirmation = document.querySelector(
      '.orderConfirmation,' +
      '#checkout-order-confirmation,' +
      '[data-test="order-confirmation"],' +
      '.body'
    );

    if (orderConfirmation) {
      orderConfirmation.parentNode.insertBefore(container, orderConfirmation.nextSibling);
    } else {
      // Fallback: append to main content area
      var main = document.querySelector('main, #main-content, .body, body');
      if (main) main.appendChild(container);
    }

    // Animate in
    requestAnimationFrame(function() {
      container.classList.add('bc-upsell--visible');
    });

    // Bind events
    bindEvents(container, offer);

    // Start timer
    if (offer.showTimer) {
      startTimer(container, offer);
    }
  }

  function bindEvents(container, offer) {
    container.addEventListener('click', function(e) {
      var target = e.target;
      var action = target.getAttribute('data-action');
      if (!action) {
        // Check parent
        target = target.parentElement;
        if (target) action = target.getAttribute('data-action');
      }
      if (!action) return;

      var offerId = offer.offerId;

      if (action === 'accept') {
        handleAccept(container, offerId);
      } else if (action === 'decline') {
        handleDecline(container, offerId);
      } else if (action === 'close') {
        handleDecline(container, offerId);
      }
    });
  }

  function handleAccept(container, offerId) {
    var ctaBtn = container.querySelector('.bc-upsell__cta');
    if (ctaBtn) {
      ctaBtn.disabled = true;
      ctaBtn.textContent = 'Adding to your order...';
      ctaBtn.classList.add('bc-upsell__cta--loading');
    }

    acceptOffer(offerId)
      .then(function(result) {
        if (result.success) {
          showSuccess(container, result);
        } else if (result.checkoutUrl) {
          // Redirect to checkout for payment
          showRedirect(container, result.checkoutUrl);
        } else {
          showError(container, 'Something went wrong. Please try again.');
          if (ctaBtn) {
            ctaBtn.disabled = false;
            ctaBtn.textContent = 'Try Again';
            ctaBtn.classList.remove('bc-upsell__cta--loading');
          }
        }
      })
      .catch(function() {
        showError(container, 'Network error. Please try again.');
        if (ctaBtn) {
          ctaBtn.disabled = false;
          ctaBtn.textContent = 'Try Again';
          ctaBtn.classList.remove('bc-upsell__cta--loading');
        }
      });
  }

  function handleDecline(container, offerId) {
    trackEvent(offerId, 'declined');
    container.classList.remove('bc-upsell--visible');
    setTimeout(function() {
      container.remove();
    }, 400);
  }

  function showSuccess(container, result) {
    var card = container.querySelector('.bc-upsell__card');
    if (!card) return;

    card.innerHTML =
      '<div class="bc-upsell__success">' +
        '<div class="bc-upsell__success-icon">✅</div>' +
        '<h3 class="bc-upsell__success-title">Added to your order!</h3>' +
        '<p class="bc-upsell__success-desc">' +
          (result.revenue ? 'You saved on this exclusive offer.' : 'Your order has been updated.') +
        '</p>' +
        (result.upsellOrderId ? '<p class="bc-upsell__success-order">New order #' + result.upsellOrderId + '</p>' : '') +
      '</div>';

    setTimeout(function() {
      container.classList.remove('bc-upsell--visible');
      setTimeout(function() { container.remove(); }, 400);
    }, 4000);
  }

  function showRedirect(container, checkoutUrl) {
    var card = container.querySelector('.bc-upsell__card');
    if (!card) return;

    card.innerHTML =
      '<div class="bc-upsell__success">' +
        '<div class="bc-upsell__success-icon">🛒</div>' +
        '<h3 class="bc-upsell__success-title">Almost there!</h3>' +
        '<p class="bc-upsell__success-desc">Redirecting you to complete your purchase...</p>' +
      '</div>';

    setTimeout(function() {
      window.open(checkoutUrl, '_blank');
    }, 1500);
  }

  function showError(container, message) {
    var existing = container.querySelector('.bc-upsell__error');
    if (existing) existing.remove();

    var errorEl = document.createElement('div');
    errorEl.className = 'bc-upsell__error';
    errorEl.textContent = message;

    var actions = container.querySelector('.bc-upsell__actions');
    if (actions) {
      actions.parentNode.insertBefore(errorEl, actions);
    }

    setTimeout(function() { errorEl.remove(); }, 5000);
  }

  // ──── Timer ────
  function startTimer(container, offer) {
    var seconds = offer.timerSeconds;
    var timerEl = container.querySelector('.bc-upsell__timer-value');
    if (!timerEl) return;

    var interval = setInterval(function() {
      seconds--;
      if (seconds <= 0) {
        clearInterval(interval);
        trackEvent(offer.offerId, 'timeout');
        container.classList.remove('bc-upsell--visible');
        setTimeout(function() { container.remove(); }, 400);
        return;
      }
      timerEl.textContent = formatTime(seconds);

      // Urgency color change at < 60 seconds
      if (seconds < 60) {
        timerEl.classList.add('bc-upsell__timer-value--urgent');
      }
    }, 1000);
  }

  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  // ──── Utilities ────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ──── Scoped CSS ────
  function injectStyles() {
    if (document.getElementById('boostcart-styles')) return;

    var style = document.createElement('style');
    style.id = 'boostcart-styles';
    style.textContent = [
      /* Reset & Container */
      '.bc-upsell { position: relative; max-width: 600px; margin: 24px auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease, transform 0.4s ease; z-index: 9999; }',
      '.bc-upsell--visible { opacity: 1; transform: translateY(0); }',

      /* Card */
      '.bc-upsell__card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04); padding: 28px; position: relative; overflow: hidden; border: 1px solid #e5e7eb; }',

      /* Close */
      '.bc-upsell__close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 24px; color: #9ca3af; cursor: pointer; padding: 4px 8px; line-height: 1; z-index: 2; transition: color 0.2s; }',
      '.bc-upsell__close:hover { color: #374151; }',

      /* Badge */
      '.bc-upsell__badge { display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px; letter-spacing: 0.5px; }',

      /* Header */
      '.bc-upsell__header { margin-bottom: 20px; }',
      '.bc-upsell__title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 6px 0; line-height: 1.3; }',
      '.bc-upsell__desc { font-size: 14px; color: #6b7280; margin: 0; line-height: 1.5; }',

      /* Product */
      '.bc-upsell__product { display: flex; gap: 16px; padding: 16px; background: #f9fafb; border-radius: 12px; margin-bottom: 20px; align-items: center; }',
      '.bc-upsell__image-wrap { flex-shrink: 0; width: 100px; height: 100px; border-radius: 10px; overflow: hidden; background: #fff; border: 1px solid #e5e7eb; }',
      '.bc-upsell__image { width: 100%; height: 100%; object-fit: cover; }',
      '.bc-upsell__details { flex: 1; min-width: 0; }',
      '.bc-upsell__product-name { font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 4px 0; }',
      '.bc-upsell__product-desc { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',

      /* Pricing */
      '.bc-upsell__pricing { display: flex; align-items: center; gap: 8px; }',
      '.bc-upsell__price-original { font-size: 14px; color: #9ca3af; text-decoration: line-through; }',
      '.bc-upsell__price-final { font-size: 20px; font-weight: 700; color: #059669; }',

      /* Timer */
      '.bc-upsell__timer { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px; background: #fef3c7; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #92400e; }',
      '.bc-upsell__timer-icon { font-size: 16px; }',
      '.bc-upsell__timer-value { font-weight: 700; font-variant-numeric: tabular-nums; }',
      '.bc-upsell__timer-value--urgent { color: #dc2626; animation: bc-pulse 1s ease-in-out infinite; }',

      /* Actions */
      '.bc-upsell__actions { display: flex; flex-direction: column; gap: 10px; }',
      '.bc-upsell__cta { width: 100%; padding: 14px 24px; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; font-size: 16px; font-weight: 600; border: none; border-radius: 10px; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }',
      '.bc-upsell__cta:hover { background: linear-gradient(135deg, #1d4ed8, #2563eb); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,99,235,0.3); }',
      '.bc-upsell__cta:active { transform: translateY(0); }',
      '.bc-upsell__cta:disabled { opacity: 0.7; cursor: wait; }',
      '.bc-upsell__cta--loading { background: #6b7280; }',
      '.bc-upsell__decline { width: 100%; padding: 10px; background: transparent; border: none; color: #9ca3af; font-size: 13px; cursor: pointer; transition: color 0.2s; }',
      '.bc-upsell__decline:hover { color: #6b7280; }',

      /* Secure note */
      '.bc-upsell__secure { text-align: center; font-size: 12px; color: #9ca3af; margin: 12px 0 0 0; }',

      /* Error */
      '.bc-upsell__error { background: #fef2f2; color: #dc2626; padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; text-align: center; }',

      /* Success */
      '.bc-upsell__success { text-align: center; padding: 20px 0; }',
      '.bc-upsell__success-icon { font-size: 48px; margin-bottom: 12px; }',
      '.bc-upsell__success-title { font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 8px 0; }',
      '.bc-upsell__success-desc { font-size: 14px; color: #6b7280; margin: 0 0 8px 0; }',
      '.bc-upsell__success-order { font-size: 12px; color: #9ca3af; margin: 0; }',

      /* Animation */
      '@keyframes bc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }',

      /* Mobile Responsive */
      '@media (max-width: 640px) {',
      '  .bc-upsell { margin: 16px 12px; }',
      '  .bc-upsell__card { padding: 20px; }',
      '  .bc-upsell__title { font-size: 18px; }',
      '  .bc-upsell__product { flex-direction: column; align-items: flex-start; gap: 12px; }',
      '  .bc-upsell__image-wrap { width: 80px; height: 80px; }',
      '  .bc-upsell__price-final { font-size: 18px; }',
      '  .bc-upsell__cta { padding: 12px 20px; font-size: 15px; }',
      '}',
    ].join('\n');

    document.head.appendChild(style);
  }

  // ──── Boot ────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Small delay to ensure BC's own scripts have rendered the page
    setTimeout(init, 500);
  }
})();
