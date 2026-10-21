
        document.addEventListener('DOMContentLoaded', function () {

            // =============================================================
            // 2026 TOP FLOATING TOAST CONTROLLER (Logout / Disconnect / Status)
            // =============================================================
            window.showTopNotification = function (message, title, type) {
                const toast = document.getElementById('topNotificationToast');
                const msgEl = document.getElementById('topNotificationMessage');
                const titleEl = document.getElementById('topNotificationTitle');
                const iconBox = document.getElementById('topToastIconBox');

                if (!toast || !msgEl) return;

                const defaultMsg = type === 'disconnect' ? 'تم قطع اتصالك بنجاح' : 'تم تسجيل خروجك بنجاح';
                msgEl.textContent = message || defaultMsg;
                if (titleEl) {
                    titleEl.textContent = title || (type === 'disconnect' ? 'قطع الاتصال' : 'تسجيل الخروج');
                }

                if (type === 'disconnect') {
                    toast.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.95) 100%)';
                    toast.style.borderColor = 'rgba(56, 189, 248, 0.75)';
                    toast.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
                    if (iconBox) {
                        iconBox.style.background = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                        iconBox.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.45)';
                    }
                    if (titleEl) titleEl.style.color = '#7dd3fc';
                } else {
                    toast.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(6, 78, 59, 0.95) 100%)';
                    toast.style.borderColor = 'rgba(52, 211, 153, 0.65)';
                    toast.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
                    if (iconBox) {
                        iconBox.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                        iconBox.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.45)';
                    }
                    if (titleEl) titleEl.style.color = '#6ee7b7';
                }

                toast.classList.remove('hide');
                toast.classList.add('show');

                if (window._topToastTimer) clearTimeout(window._topToastTimer);
                window._topToastTimer = setTimeout(function () {
                    window.hideTopNotification();
                }, 4500);
            };

            window.hideTopNotification = function () {
                const toast = document.getElementById('topNotificationToast');
                if (toast) {
                    toast.classList.remove('show');
                    toast.classList.add('hide');
                }
            };

            // Check URL search parameters or hash for logout/disconnect
            function checkLogoutUrlParams() {
                try {
                    const search = window.location.search || '';
                    const params = new URLSearchParams(search);
                    if (params.has('logout') || search.includes('logout')) {
                        setTimeout(function () {
                            window.showTopNotification('تم تسجيل خروجك بنجاح', 'تسجيل الخروج', 'logout');
                        }, 250);
                        if (window.history && window.history.replaceState) {
                            const newUrl = window.location.pathname + window.location.hash;
                            window.history.replaceState({}, document.title, newUrl);
                        }
                        return true;
                    } else if (params.has('disconnect') || search.includes('disconnect')) {
                        setTimeout(function () {
                            window.showTopNotification('تم قطع اتصالك بنجاح', 'قطع الاتصال', 'disconnect');
                        }, 250);
                        if (window.history && window.history.replaceState) {
                            const newUrl = window.location.pathname + window.location.hash;
                            window.history.replaceState({}, document.title, newUrl);
                        }
                        return true;
                    }
                } catch (e) {}
                return false;
            }

            // Check sessionStorage for pending logout toast (persists across redirects/reloads)
            function checkPendingLogoutStorage() {
                try {
                    const pendingRaw = sessionStorage.getItem('pending_logout_toast');
                    if (pendingRaw) {
                        sessionStorage.removeItem('pending_logout_toast');
                        const data = JSON.parse(pendingRaw);
                        setTimeout(function () {
                            window.showTopNotification(data.msg, data.title, data.type);
                        }, 250);
                        return true;
                    }
                } catch (e) {}
                return false;
            }

            // Bind click handlers to all logout and disconnect buttons
            function bindLogoutActionButtons() {
                document.addEventListener('click', function (e) {
                    const logoutBtn = e.target.closest('.app-logout, [data-action-logout], [data-action-disconnect], a[href*="logout"]');
                    if (!logoutBtn) return;

                    // Exclude modal close buttons inside other popups (like app-store close button)
                    if (logoutBtn.classList.contains('modal-close-btn') || logoutBtn.classList.contains('back')) {
                        if (!logoutBtn.closest('#status')) return;
                    }

                    const isErase = logoutBtn.hasAttribute('erase-cookie') || 
                                    logoutBtn.hasAttribute('clear-hot-cookie') || 
                                    (logoutBtn.textContent && logoutBtn.textContent.includes('خروج'));

                    const toastData = isErase 
                        ? { msg: 'تم تسجيل خروجك بنجاح', title: 'تسجيل الخروج', type: 'logout' }
                        : { msg: 'تم قطع اتصالك بنجاح', title: 'قطع الاتصال', type: 'disconnect' };

                    // Save to sessionStorage in case of page reload/navigation
                    try {
                        sessionStorage.setItem('pending_logout_toast', JSON.stringify(toastData));
                    } catch (err) {}

                    // Trigger toast in SPA view when status closes
                    setTimeout(function () {
                        const statusActive = document.getElementById('status')?.classList.contains('active');
                        if (!statusActive) {
                            try {
                                sessionStorage.removeItem('pending_logout_toast');
                            } catch (err) {}
                            window.showTopNotification(toastData.msg, toastData.title, toastData.type);
                        }
                    }, 280);
                }, true);
            }

            // Hook into onLoggedOut callback if triggered via AJAX
            const originalOnLoggedOut = window.onLoggedOut;
            window.onLoggedOut = function (data) {
                if (typeof originalOnLoggedOut === 'function') {
                    try { originalOnLoggedOut(data); } catch (e) {}
                }
                const pendingRaw = sessionStorage.getItem('pending_logout_toast');
                let toastData = { msg: 'تم تسجيل خروجك بنجاح', title: 'تسجيل الخروج', type: 'logout' };
                if (pendingRaw) {
                    try {
                        toastData = JSON.parse(pendingRaw);
                        sessionStorage.removeItem('pending_logout_toast');
                    } catch (e) {}
                }
                setTimeout(function () {
                    window.showTopNotification(toastData.msg, toastData.title, toastData.type);
                }, 200);
            };

            // Run initial checks on page load
            if (!checkLogoutUrlParams()) {
                checkPendingLogoutStorage();
            }
            bindLogoutActionButtons();

            // 1. DYNAMIC CAROUSEL CONTROLLER WITH AUTO-DISCOVERY & SEAMLESS LOOP
            function initDynamicAdCarousel() {
                const wrapper = document.getElementById('adsCarouselWrapper');
                const track = document.getElementById('carouselTrack');
                const dotsContainer = document.getElementById('carouselDots');
                const prevBtn = document.getElementById('carouselPrev');
                const nextBtn = document.getElementById('carouselNext');
                const carouselContainer = document.getElementById('adCarousel');

                if (!track || !carouselContainer) return;

                let autoplayInterval = null;
                let transitionSafetyTimeout = null;
                let currentRenderedImagesKey = '';

                function renderCarousel(images) {
                    if (!images || images.length === 0) {
                        if (wrapper) wrapper.style.display = 'none';
                        return;
                    }

                    const imagesKey = images.join(',');
                    if (imagesKey === currentRenderedImagesKey && track.children.length > 0) {
                        return; // Already cleanly rendered, avoid layout jump
                    }
                    currentRenderedImagesKey = imagesKey;

                    if (autoplayInterval) clearInterval(autoplayInterval);
                    autoplayInterval = null;

                    if (wrapper) wrapper.style.display = 'block';

                    const existingImages = Array.from(track.querySelectorAll('.carousel-slide img'))
                        .map(img => (img.getAttribute('src') || '').split('/').pop());
                    const trackAlreadyMatches = existingImages.length === images.length &&
                        existingImages.every((name, idx) => name === images[idx]);

                    // Reuse the server-rendered images when they already match config.
                    if (!trackAlreadyMatches) {
                        track.innerHTML = images.map((img, idx) => `
                            <div class="carousel-slide">
                                <img class="im${idx + 1}" src="./adimg/${img}" alt="إعلان ${idx + 1}" ${idx === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'} decoding="async">
                            </div>
                        `).join('');
                    }

                    if (dotsContainer) {
                        dotsContainer.innerHTML = images.map((_, idx) => `
                            <span class="carousel-dot ${idx === 0 ? 'active' : ''}"></span>
                        `).join('');
                    }

                    const originalSlides = Array.from(track.querySelectorAll('.carousel-slide'));
                    const totalSlides = originalSlides.length;
                    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.carousel-dot')) : [];

                    if (totalSlides <= 1) {
                        if (prevBtn) prevBtn.style.display = 'none';
                        if (nextBtn) nextBtn.style.display = 'none';
                        if (dotsContainer) dotsContainer.style.display = 'none';
                        track.style.transform = 'none';
                        track.style.transition = 'none';
                        return;
                    }

                    if (prevBtn) prevBtn.style.display = 'flex';
                    if (nextBtn) nextBtn.style.display = 'flex';
                    if (dotsContainer) dotsContainer.style.display = 'flex';

                    const firstClone = originalSlides[0].cloneNode(true);
                    const lastClone = originalSlides[totalSlides - 1].cloneNode(true);
                    firstClone.classList.add('carousel-clone');
                    lastClone.classList.add('carousel-clone');

                    track.insertBefore(lastClone, track.firstElementChild);
                    track.appendChild(firstClone);

                    let currentIndex = 1;
                    let isTransitioning = false;

                    track.style.transition = 'none';
                    track.style.transform = `translateX(-${currentIndex * 100}%)`;
                    track.offsetHeight;
                    track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

                    function updateDots() {
                        const realIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                        dots.forEach((dot, idx) => {
                            dot.classList.toggle('active', idx === realIndex);
                        });
                    }

                    function goToSlide(index, animated = true) {
                        currentIndex = index;
                        if (animated) {
                            track.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
                        } else {
                            track.style.transition = 'none';
                        }
                        track.style.transform = `translateX(-${currentIndex * 100}%)`;
                        updateDots();

                        clearTimeout(transitionSafetyTimeout);
                        if (animated) {
                            isTransitioning = true;
                            transitionSafetyTimeout = setTimeout(function () {
                                checkCloneReset();
                                isTransitioning = false;
                            }, 500);
                        }
                    }

                    function checkCloneReset() {
                        if (currentIndex === totalSlides + 1) {
                            track.style.transition = 'none';
                            currentIndex = 1;
                            track.style.transform = `translateX(-${currentIndex * 100}%)`;
                            track.offsetHeight;
                        } else if (currentIndex === 0) {
                            track.style.transition = 'none';
                            currentIndex = totalSlides;
                            track.style.transform = `translateX(-${currentIndex * 100}%)`;
                            track.offsetHeight;
                        }
                        isTransitioning = false;
                    }

                    track.addEventListener('transitionend', function (e) {
                        if (e.target === track && e.propertyName === 'transform') {
                            checkCloneReset();
                        }
                    });

                    function nextSlide() {
                        if (isTransitioning) return;
                        goToSlide(currentIndex + 1);
                    }

                    function prevSlide() {
                        if (isTransitioning) return;
                        goToSlide(currentIndex - 1);
                    }

                    function startAutoplay() {
                        stopAutoplay();
                        autoplayInterval = setInterval(function () {
                            nextSlide();
                        }, 4000);
                    }

                    function stopAutoplay() {
                        if (autoplayInterval) clearInterval(autoplayInterval);
                    }

                    if (prevBtn) {
                        prevBtn.onclick = function () { prevSlide(); startAutoplay(); };
                    }
                    if (nextBtn) {
                        nextBtn.onclick = function () { nextSlide(); startAutoplay(); };
                    }

                    dots.forEach(function (dot, idx) {
                        dot.onclick = function () {
                            if (isTransitioning) return;
                            goToSlide(idx + 1);
                            startAutoplay();
                        };
                    });

                    let touchStartX = 0;
                    let touchEndX = 0;

                    carouselContainer.ontouchstart = function (e) {
                        touchStartX = e.changedTouches[0].screenX;
                        stopAutoplay();
                    };

                    carouselContainer.ontouchend = function (e) {
                        touchEndX = e.changedTouches[0].screenX;
                        var diff = touchEndX - touchStartX;
                        if (Math.abs(diff) > 40) {
                            if (diff > 0) {
                                prevSlide();
                            } else {
                                nextSlide();
                            }
                        }
                        startAutoplay();
                    };

                    startAutoplay();
                }

                window.renderAdCarousel = renderCarousel;

                // 1. Immediate Instant Initialization (Zero Delay)
                var initialConfigImgs = (window.hotspotConfig && Array.isArray(window.hotspotConfig['ad-images']) && window.hotspotConfig['ad-images'].length > 0)
                    ? window.hotspotConfig['ad-images']
                    : ['1.jpg', '2.jpg'];
                renderCarousel(initialConfigImgs);

                // 2. Dynamic Update listener for config changes
                if (window.hotspotConfig && Array.isArray(window.hotspotConfig['ad-images']) && window.hotspotConfig['ad-images'].length > 0) {
                    renderCarousel(window.hotspotConfig['ad-images']);
                }
            }

            initDynamicAdCarousel();

            // 2. UNIVERSAL MODAL CONTROLLER & POPUP SCROLL LOCK MANAGER
            window.animating = false;

            window.ModalScrollLock = {
                lockCount: 0,

                isAnyModalOpen: function () {
                    // A class alone is not proof that a modal is visible. Feature flags can
                    // force display:none while leaving .active behind, which used to keep
                    // html/body locked and made the entire page impossible to scroll.
                    function isRendered(element) {
                        if (!element || !document.documentElement.contains(element) || element.hidden) return false;
                        var style;
                        try { style = window.getComputedStyle(element); } catch (e) { return false; }
                        if (style.display === 'none' || style.visibility === 'hidden' || element.getClientRects().length === 0) return false;
                        /* Ignore overlays that exist in the DOM but are still hidden at opacity 0. */
                        var opacity = parseFloat(style.opacity);
                        if (!isNaN(opacity) && opacity <= 0.01 &&
                            !element.classList.contains('active') &&
                            !element.classList.contains('nt-modal-show') &&
                            !element.classList.contains('nt-card-show')) return false;
                        return true;
                    }
                    var appModals = document.querySelectorAll('.app.active:not(#status)');
                    for (var i = 0; i < appModals.length; i++) if (isRendered(appModals[i])) return true;
                    var loyaltyModals = document.querySelectorAll('.loyalty-modal.active, #points-register-modal.active');
                    for (var j = 0; j < loyaltyModals.length; j++) if (isRendered(loyaltyModals[j])) return true;
                    var notificationModals = document.querySelectorAll('.nt-modal-overlay.nt-modal-show:not(.nt-modal-hide), .nt-card-overlay.nt-card-show:not(.nt-card-hide)');
                    for (var k = 0; k < notificationModals.length; k++) if (isRendered(notificationModals[k])) return true;
                    return false;
                },

                lock: function () {
                    this.lockCount++;
                    document.documentElement.classList.add('modal-scroll-locked');
                    document.body.classList.add('modal-scroll-locked');
                    document.body.style.overflow = 'hidden';
                    document.documentElement.style.overflow = 'hidden';
                },

                unlock: function (force) {
                    if (force) {
                        this.lockCount = 0;
                    } else {
                        this.lockCount = Math.max(0, this.lockCount - 1);
                    }

                    if (this.lockCount === 0 || !this.isAnyModalOpen()) {
                        this.lockCount = 0;
                        document.documentElement.classList.remove('modal-scroll-locked');
                        document.body.classList.remove('modal-scroll-locked');
                        document.body.style.overflow = '';
                        document.documentElement.style.overflow = '';
                    }
                },

                sync: function () {
                    if (this.isAnyModalOpen()) {
                        this.lock();
                    } else {
                        this.unlock(true);
                    }
                },

                init: function () {
                    var self = this;
                    // Release stale inline/class locks before the browser decides how to handle a new gesture.
                    function recoverStaleLock() {
                        if (!self.isAnyModalOpen() && (
                            document.body.classList.contains('modal-scroll-locked') ||
                            document.documentElement.classList.contains('modal-scroll-locked') ||
                            document.body.style.overflow === 'hidden' ||
                            document.documentElement.style.overflow === 'hidden'
                        )) self.unlock(true);
                    }
                    document.addEventListener('touchstart', recoverStaleLock, { passive: true, capture: true });
                    document.addEventListener('pointerdown', recoverStaleLock, { passive: true, capture: true });
                    window.addEventListener('pageshow', recoverStaleLock);
                    window.addEventListener('focus', recoverStaleLock);
                    document.addEventListener('DOMContentLoaded', recoverStaleLock, { once: true });
                    setTimeout(recoverStaleLock, 0);
                    setTimeout(recoverStaleLock, 350);
                    // Prevent background scrolling on touch gestures outside scrollable modal containers
                    document.addEventListener('touchmove', function (e) {
                        if (document.body.classList.contains('modal-scroll-locked')) {
                            // Recover from a stale lock before blocking a user's swipe.
                            if (!self.isAnyModalOpen()) {
                                self.unlock(true);
                                return;
                            }
                            var scrollable = e.target.closest('#login, #status, .modal-sheet-card, .loyalty-modal-content, .nt-modal, .nt-card, .price-div, .sell-point-div, .points-modal-body, .loyalty-modal-body, .loan-body');
                            if (!scrollable) e.preventDefault();
                        }
                    }, { passive: false });

                    // Prevent wheel scroll bleed-through only while a modal is actually open.
                    document.addEventListener('wheel', function (e) {
                        if (document.body.classList.contains('modal-scroll-locked')) {
                            if (!self.isAnyModalOpen()) {
                                self.unlock(true);
                                return;
                            }
                            var scrollable = e.target.closest('#login, #status, .modal-sheet-card, .loyalty-modal-content, .nt-modal, .nt-card, .price-div, .sell-point-div, .points-modal-body, .loyalty-modal-body, .loan-body');
                            if (!scrollable) e.preventDefault();
                        }
                    }, { passive: false });

                    // Auto-sync observer to maintain accurate state
                    try {
                        var observer = new MutationObserver(function () {
                            var anyOpen = self.isAnyModalOpen();
                            if (anyOpen && !document.body.classList.contains('modal-scroll-locked')) {
                                self.lock();
                            } else if (!anyOpen && document.body.classList.contains('modal-scroll-locked')) {
                                self.unlock(true);
                            }
                        });
                        if (document.body) {
                            observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'], childList: true });
                        }
                    } catch (err) {}
                }
            };
            window.ModalScrollLock.init();

            function openAppModal(modalId) {
                window.animating = false;
                const modal = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
                if (!modal) return;

                // Close any other open modals
                document.querySelectorAll('.app.active').forEach(function(m) {
                    if (m !== modal && m.id !== 'status') {
                        m.classList.remove('active');
                        m.style.display = 'none';
                    }
                });

                const isStatusActive = document.getElementById('status')?.classList.contains('active');
                const loginEl = document.getElementById('login');
                if (!isStatusActive && loginEl) {
                    loginEl.classList.add('inactive');
                }

                modal.style.display = 'block';
                // Trigger reflow for CSS transition
                void modal.offsetWidth;
                modal.classList.add('active');

                // Lock background scroll
                if (window.ModalScrollLock) {
                    window.ModalScrollLock.lock();
                } else {
                    document.body.style.overflow = 'hidden';
                }

                // Camera is started by the button handler before openAppModal is called.
                // Do NOT call startCamera() here to avoid a second duplicate request.
            }

            function closeAppModal(modalOrId) {
                window.animating = false;
                let target = null;
                if (typeof modalOrId === 'string') {
                    target = document.getElementById(modalOrId);
                } else if (modalOrId instanceof HTMLElement) {
                    target = modalOrId;
                }

                if (target) {
                    target.classList.remove('active');
                    setTimeout(() => {
                        if (!target.classList.contains('active')) {
                            target.style.display = 'none';
                        }
                    }, 180);
                    if (target.id === 'qr-scanner-modal' && typeof window.stopCamera === 'function') {
                        window.stopCamera();
                    }
                } else {
                    document.querySelectorAll('.app.active').forEach(m => {
                        if (m.id !== 'status') {
                            m.classList.remove('active');
                            setTimeout(() => {
                                if (!m.classList.contains('active')) {
                                    m.style.display = 'none';
                                }
                            }, 180);
                            if (m.id === 'qr-scanner-modal' && typeof window.stopCamera === 'function') {
                                window.stopCamera();
                            }
                        }
                    });
                }

                const isStatusActive = document.getElementById('status')?.classList.contains('active');
                const loginEl = document.getElementById('login');
                if (!isStatusActive && loginEl) {
                    loginEl.style.display = 'block';
                    loginEl.style.visibility = 'visible';
                    loginEl.classList.remove('inactive');
                }

                // Unlock background scroll
                if (window.ModalScrollLock) {
                    window.ModalScrollLock.unlock();
                } else {
                    document.body.style.overflow = '';
                }
            }

            // Expose globally for legacy/inline scripts
            window.openAppModal = openAppModal;
            window.closeAppModal = closeAppModal;

            // Universal Click Handler for All Modal Close & Cancel Buttons
            document.addEventListener('click', function (e) {
                const closeTrigger = e.target.closest('.modal-close-btn, .modal-cancel-btn, .back, button[data-modal-close]');
                if (closeTrigger) {
                    const parentApp = closeTrigger.closest('.app');
                    if (parentApp && parentApp.id !== 'status') {
                        e.preventDefault();
                        e.stopPropagation();
                        closeAppModal(parentApp);
                        return;
                    }
                }

                // Clicking on dark backdrop outside modal card
                if (e.target.classList && e.target.classList.contains('app') && e.target.classList.contains('active') && e.target.id !== 'status') {
                    e.preventDefault();
                    closeAppModal(e.target);
                }
            }, true);

            // Modal Trigger Buttons (parent-id and dedicated IDs)
            document.querySelectorAll('button[parent-id], [data-open-modal]').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    if (this.id === 'openQrScannerBtn') return; // Handled specifically with direct camera start
                    const parentId = this.getAttribute('parent-id') || this.getAttribute('data-open-modal');
                    if (parentId && parentId !== 'status') {
                        e.preventDefault();
                        e.stopPropagation();
                        openAppModal(parentId);
                    }
                }, true);
            });

            // 3. SPEED SELECTOR & MODAL POPUP DYNAMIC SYNC (LOGIN & STATUS SCREENS)
            const speedSelect = document.getElementById('speed');
            const speedModalList = document.getElementById('speedModalList');
            const statusSpeedModalList = document.getElementById('statusSpeedModalList');
            const selectedSpeedDisplay = document.getElementById('selectedSpeedDisplay');
            const statusSpeedTriggerText = document.getElementById('statusSpeedTriggerText');
            const sspeedSpan = document.getElementById('sspeed');
            const speedchange = document.getElementById('speedchange');

            let speedLabelMap = {
                '1M': 'سرعة اقتصادية',
                '2M': 'سرعة عادية',
                '4M': 'سرعة متوسطة',
                '6M': 'سرعة عالية',
                '': 'سرعة هوتسبوت'
            };
            if (window.hotspotConfig && Array.isArray(window.hotspotConfig.speeds)) {
                window.hotspotConfig.speeds.forEach(function(s) {
                    if (s && s.name) speedLabelMap[s.value] = s.name;
                });
            }

            function updateSpeedSelection(val, title, clickedCard) {
                if (speedSelect) {
                    // Find matching option by value and text if possible
                    let matchedOpt = null;
                    if (title) {
                        matchedOpt = Array.from(speedSelect.options).find(o => o.value === val && o.text.trim() === title.trim());
                    }
                    if (matchedOpt) {
                        speedSelect.selectedIndex = matchedOpt.index;
                    } else {
                        speedSelect.value = val;
                    }
                    const event = new Event('change', { bubbles: true });
                    speedSelect.dispatchEvent(event);
                }
                const speedTitle = title || speedLabelMap[val] || val;
                if (selectedSpeedDisplay && speedTitle) {
                    selectedSpeedDisplay.textContent = speedTitle;
                }
                const cards = document.querySelectorAll('#speed-modal .speed-card-option');
                cards.forEach(card => {
                    if (clickedCard) {
                        card.classList.toggle('active', card === clickedCard);
                    } else if (title) {
                        card.classList.toggle('active', card.getAttribute('data-speed-title') === title && card.getAttribute('data-speed') === val);
                    } else {
                        card.classList.toggle('active', card.getAttribute('data-speed') === val);
                    }
                });
            }

            function bindLoginSpeedCards() {
                const cards = document.querySelectorAll('#speed-modal .speed-card-option');
                cards.forEach(card => {
                    card.onclick = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = this.getAttribute('data-speed');
                        const speedTitle = this.getAttribute('data-speed-title') || speedLabelMap[val] || val;

                        updateSpeedSelection(val, speedTitle, this);

                        setTimeout(() => {
                            closeAppModal('speed-modal');
                        }, 180);
                    };
                });
            }

            function bindStatusSpeedCards() {
                const statusCards = document.querySelectorAll('#status-speed-modal .speed-card-option');
                statusCards.forEach(card => {
                    card.onclick = function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const val = this.getAttribute('data-status-speed');
                        const speedTitle = this.getAttribute('data-speed-title') || speedLabelMap[val] || val;

                        statusCards.forEach(c => c.classList.toggle('active', c === this));

                        if (statusSpeedTriggerText && speedTitle) {
                            statusSpeedTriggerText.textContent = speedTitle;
                        }
                        if (speedchange) {
                            speedchange.value = val;
                            const ev = new Event('change', { bubbles: true });
                            speedchange.dispatchEvent(ev);
                        }

                        setTimeout(() => {
                            closeAppModal('status-speed-modal');
                        }, 180);
                    };
                });
            }

            function applyDynamicSpeeds(speedsArray, enableUltra = true) {
                if (!Array.isArray(speedsArray) || speedsArray.length === 0) return;

                speedLabelMap = {};
                speedsArray.forEach(s => {
                    if (s.value && s.name) {
                        speedLabelMap[s.value] = s.name;
                    }
                });

                const activeSpeeds = speedsArray.filter(s => {
                    if (s.value === '1M/8M' && enableUltra === false) return false;
                    return true;
                });

                let defaultSpeed = activeSpeeds.find(s => s.default === true) || activeSpeeds[0];

                if (speedSelect) {
                    speedSelect.innerHTML = `<option value="" disabled hidden>أختيار سرعة الإنترنت</option>` +
                        activeSpeeds.map(s => `<option value="${s.value}" ${s.value === defaultSpeed.value ? 'selected' : ''}>${s.name}</option>`).join('');
                }

                if (speedchange) {
                    speedchange.innerHTML = `<option value="cancel" hidden selected disabled>تغيير السرعة</option>` +
                        activeSpeeds.map(s => `<option value="${s.value}">${s.name}</option>`).join('');
                }

                if (speedModalList) {
                    speedModalList.innerHTML = activeSpeeds.map((s) => `
                        <div class="speed-card-option ${s.value === defaultSpeed.value ? 'active' : ''}" data-speed="${s.value}" data-speed-title="${s.name}">
                            <div class="speed-card-indicator">
                                <div class="speed-radio-dot"></div>
                            </div>
                            <div class="speed-card-info">
                                <span class="speed-card-name">${s.name} ${s.recommended ? '<span style="opacity:0.85;font-size:0.85em;color:var(--accent-gold);">(الموصى بها)</span>' : ''}</span>
                            </div>
                        </div>
                    `).join('');
                    bindLoginSpeedCards();
                }

                if (statusSpeedModalList) {
                    statusSpeedModalList.innerHTML = activeSpeeds.map((s) => `
                        <div class="speed-card-option ${s.value === defaultSpeed.value ? 'active' : ''}" data-status-speed="${s.value}" data-speed-title="${s.name}">
                            <div class="speed-card-indicator">
                                <div class="speed-radio-dot"></div>
                            </div>
                            <div class="speed-card-info">
                                <span class="speed-card-name">${s.name} ${s.recommended ? '<span style="opacity:0.85;font-size:0.85em;color:var(--accent-gold);">(الموصى بها)</span>' : ''}</span>
                            </div>
                        </div>
                    `).join('');
                    bindStatusSpeedCards();
                }

                if (defaultSpeed && selectedSpeedDisplay) {
                    selectedSpeedDisplay.textContent = defaultSpeed.name;
                }
            }

            // Apply configuration dynamically from config.js
            try {
                var applyConfigOptions = function(configObj) {
                    if (configObj['ad-images'] && Array.isArray(configObj['ad-images']) && configObj['ad-images'].length > 0) {
                        if (typeof window.renderAdCarousel === 'function') {
                            window.renderAdCarousel(configObj['ad-images']);
                        }
                    }

                    if (configObj.speeds && Array.isArray(configObj.speeds)) {
                        applyDynamicSpeeds(configObj.speeds, configObj['enable-ultra-speed'] !== false);
                    } else {
                        var optUltra = document.getElementById('opt-speed-ultra');
                        var cardUltra = document.getElementById('card-speed-ultra');
                        var cardStatusUltra = document.getElementById('card-status-speed-ultra');
                        
                        if (configObj['enable-ultra-speed']) {
                            if (optUltra) { optUltra.style.display = ''; optUltra.removeAttribute('disabled'); }
                            if (cardUltra) cardUltra.style.display = '';
                            if (cardStatusUltra) cardStatusUltra.style.display = '';
                        } else {
                            if (optUltra) { optUltra.style.display = 'none'; optUltra.setAttribute('disabled', 'disabled'); }
                            if (cardUltra) cardUltra.style.display = 'none';
                            if (cardStatusUltra) cardStatusUltra.style.display = 'none';
                        }
                    }

                    // Apply Loyalty / Points system toggle dynamically from config.js
                    if (configObj['enable-loyalty-system'] === false) {
                        document.documentElement.classList.add('loyalty-system-disabled');
                        if (document.body) document.body.classList.add('loyalty-system-disabled');
                        const loyaltyElements = [
                            document.getElementById('loyalty-unregistered-section'),
                            document.getElementById('loyalty-registered-section'),
                            document.getElementById('loyalty-unregistered-section-status'),
                            document.getElementById('loyalty-registered-section-status'),
                            document.getElementById('points-register-modal')
                        ];
                        loyaltyElements.forEach(el => {
                            if (el) el.style.setProperty('display', 'none', 'important');
                        });
                        document.querySelectorAll('.points-notice-alert, .loyalty-register-btn, .points-register-btn, .loyalty-user-card, .loyalty-modal').forEach(el => {
                            if (el) el.style.setProperty('display', 'none', 'important');
                        });
                    } else {
                        document.documentElement.classList.remove('loyalty-system-disabled');
                        if (document.body) document.body.classList.remove('loyalty-system-disabled');
                        if (typeof window.updateInlinePointsElements === 'function') {
                            window.updateInlinePointsElements();
                        } else {
                            const isLogged = localStorage.getItem('points_user_logged_in') === 'true';
                            const regSec = document.getElementById('loyalty-registered-section');
                            const unregSec = document.getElementById('loyalty-unregistered-section');
                            const regStatusSec = document.getElementById('loyalty-registered-section-status');
                            const unregStatusSec = document.getElementById('loyalty-unregistered-section-status');
                            if (isLogged) {
                                if (regSec) regSec.style.display = 'block';
                                if (regStatusSec) regStatusSec.style.display = 'block';
                                if (unregSec) unregSec.style.display = 'none';
                                if (unregStatusSec) unregStatusSec.style.display = 'none';
                            } else {
                                if (unregSec) unregSec.style.display = 'block';
                                if (unregStatusSec) unregStatusSec.style.display = 'block';
                                if (regSec) regSec.style.display = 'none';
                                if (regStatusSec) regStatusSec.style.display = 'none';
                            }
                        }
                    }

                    // Use the same renderer as index.html so empty config values never reveal stale HTML placeholders.
                    if (typeof window.applyNewsOffersConfig === 'function') {
                        window.applyNewsOffersConfig(configObj);
                    }
                };

                var configChecks = 0;
                var configCheckInterval = setInterval(function() {
                    if (typeof hotspotConfig !== 'undefined' && Object.keys(hotspotConfig).length > 0) {
                        clearInterval(configCheckInterval);
                        applyConfigOptions(hotspotConfig);
                    } else if (typeof hotOption !== 'undefined' && Object.keys(hotOption).length > 0) {
                        clearInterval(configCheckInterval);
                        applyConfigOptions(hotOption);
                    }
                    configChecks++;
                    if (configChecks > 50) clearInterval(configCheckInterval);
                }, 100);
            } catch (err) {
                console.error(err);
            }

            // Initial binding of static cards if already rendered
            bindLoginSpeedCards();
            bindStatusSpeedCards();

            if (speedSelect) {
                speedSelect.addEventListener('change', function () {
                    const val = speedSelect.value;
                    if (selectedSpeedDisplay && speedLabelMap[val]) {
                        selectedSpeedDisplay.textContent = speedLabelMap[val];
                    }
                    const cards = document.querySelectorAll('#speed-modal .speed-card-option');
                    cards.forEach(card => {
                        card.classList.toggle('active', card.getAttribute('data-speed') === val);
                    });
                });
            }

            // 4. UPDATES BLOCKER TOGGLE STATUS TEXT (LOGIN SCREEN)
            if (window.hotspotConfig && window.hotspotConfig['update-toggle-button'] === false) {
                var chUpdate = document.getElementById('chupdate');
                if (chUpdate) {
                    chUpdate.checked = false;
                    chUpdate.value = '_Uon';
                }
            } else {
                var chUpdate = document.getElementById('chupdate');
                var updateStatusText = document.getElementById('updateStatusText');
                if (chUpdate && updateStatusText) {
                    var updateToggleState = function() {
                        if (chUpdate.checked) {
                            updateStatusText.textContent = 'مفعل';
                            updateStatusText.classList.add('active');
                        } else {
                            updateStatusText.textContent = 'متوقف';
                            updateStatusText.classList.remove('active');
                        }
                    };
                    chUpdate.addEventListener('change', updateToggleState);
                    updateToggleState();
                }
            }

            // 5. STATUS SCREEN: SYNCHRONIZE LIVE SPEED FROM MIKROTIK
            if (sspeedSpan) {
                const normalizeAr = s => (s || '').replace(/[أإآ]/g, 'ا').trim();
                const syncSpeedFromMikrotik = () => {
                    const txt = (sspeedSpan.innerText || sspeedSpan.textContent || '').trim();
                    if (txt && txt !== 'سرعة الكرت') {
                        const customTitle = speedLabelMap[txt] || txt;
                        if (statusSpeedTriggerText) {
                            statusSpeedTriggerText.textContent = customTitle;
                        }
                        const cleanTxt = normalizeAr(customTitle);
                        const currentStatusSpeedCards = document.querySelectorAll('#status-speed-modal .speed-card-option');
                        let matchedCard = null;
                        currentStatusSpeedCards.forEach(card => {
                            const cardTitle = normalizeAr(card.getAttribute('data-speed-title'));
                            const speedVal = (card.getAttribute('data-status-speed') || '').trim();
                            if (cardTitle && (cardTitle === cleanTxt || speedVal === txt || speedVal === cleanTxt)) {
                                matchedCard = card;
                            }
                        });
                        if (!matchedCard) {
                            let longestMatchLen = 0;
                            currentStatusSpeedCards.forEach(card => {
                                const cardTitle = normalizeAr(card.getAttribute('data-speed-title'));
                                if (cardTitle && cleanTxt.includes(cardTitle) && cardTitle.length > longestMatchLen) {
                                    longestMatchLen = cardTitle.length;
                                    matchedCard = card;
                                }
                            });
                        }
                        currentStatusSpeedCards.forEach(card => {
                            card.classList.toggle('active', card === matchedCard);
                        });
                    }
                };
                const speedObserver = new MutationObserver(syncSpeedFromMikrotik);
                speedObserver.observe(sspeedSpan, { childList: true, characterData: true, subtree: true });
                syncSpeedFromMikrotik();
            }

            // 6. STATUS SCREEN: UPDATES BLOCKER TOGGLE (Identical to Login Screen)
            if (!(window.hotspotConfig && window.hotspotConfig['update-toggle-button'] === false)) {
                const statusChupdate = document.getElementById('statusChupdate');
                const statusUpdateStatusText = document.getElementById('statusUpdateStatusText');
                const updatechange = document.getElementById('updatechange');
                const updateSpan = document.getElementById('update');

                if (statusChupdate && statusUpdateStatusText) {
                    let isSyncing = false;
                    const updateStatusToggleState = (triggerChange = false) => {
                        if (isSyncing) return;
                        if (statusChupdate.checked) {
                            statusUpdateStatusText.textContent = 'مفعل';
                            statusUpdateStatusText.classList.add('active');
                            if (triggerChange && updatechange) {
                                updatechange.value = '_Uoff';
                                const ev = new Event('change', { bubbles: true });
                                updatechange.dispatchEvent(ev);
                            }
                        } else {
                            statusUpdateStatusText.textContent = 'متوقف';
                            statusUpdateStatusText.classList.remove('active');
                            if (triggerChange && updatechange) {
                                updatechange.value = '_Uon';
                                const ev = new Event('change', { bubbles: true });
                                updatechange.dispatchEvent(ev);
                            }
                        }
                    };

                    statusChupdate.addEventListener('change', () => updateStatusToggleState(true));

                    // Live Sync with MikroTik status query updates
                    if (updateSpan) {
                        const syncFromMikrotik = () => {
                            const text = (updateSpan.innerText || updateSpan.textContent || '').trim();
                            isSyncing = true;
                            if (text.includes('أيقاف') || text.includes('ايقاف') || text.includes('Uoff')) {
                                statusChupdate.checked = true;
                                statusUpdateStatusText.textContent = 'مفعل';
                                statusUpdateStatusText.classList.add('active');
                            } else if (text.includes('تفعيل') || text.includes('Uon')) {
                                statusChupdate.checked = false;
                                statusUpdateStatusText.textContent = 'متوقف';
                                statusUpdateStatusText.classList.remove('active');
                            }
                            isSyncing = false;
                        };

                        const observer = new MutationObserver(syncFromMikrotik);
                        observer.observe(updateSpan, { childList: true, characterData: true, subtree: true });
                        syncFromMikrotik();
                    }
                }
            }

            // 6. POINTS SYSTEM AUTH & REGISTRATION HANDLER
            const pointsModal = document.getElementById('points-register-modal');
            const openPointsRegisterBtn = document.getElementById('openPointsRegisterBtn');
            const pointsLoginFormView = document.getElementById('pointsLoginFormView');
            const goToSignupTabBtn = document.getElementById('goToSignupTabBtn');

            const pointsLoginPhone = document.getElementById('pointsLoginPhone');
            const pointsLoginPassword = document.getElementById('pointsLoginPassword');
            const togglePointsLoginPw = document.getElementById('togglePointsLoginPw');
            const submitPointsLoginBtn = document.getElementById('submitPointsLoginBtn');
            const pointsLoginAlert = document.getElementById('pointsLoginAlert');
            const pointsLoginMsg = document.getElementById('pointsLoginMsg');

            // Global modern redirect loader function
            window.showRedirectLoader = function (options = {}) {
                const url = options.url || 'https://tunisnet.shabakaty.site/auth/register';
                const title = options.title || 'جاري الانتقال لصفحة إنشاء الحساب...';
                const subtitle = options.subtitle || 'يتم تحويلك إلى بوابة التسجيل في شبكتي لنظام النقاط والمكافآت';
                const delay = options.delay || 950;

                let overlay = document.getElementById('redirectLoadingOverlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'redirectLoadingOverlay';
                    overlay.className = 'redirect-loading-overlay';
                    overlay.innerHTML = `
                        <div class="redirect-ambient-glow-burgundy"></div>
                        <div class="redirect-ambient-glow-cyan"></div>
                        <div class="redirect-loading-card">
                            <div class="redirect-brand-connector">
                                <span class="redirect-brand-tag burgundy">${(window.hotspotConfig && window.hotspotConfig['network-name'] ? ('' + window.hotspotConfig['network-name']).trim() : 'تونس نت')}</span>
                                <div class="redirect-connector-line">
                                    <div class="redirect-connector-dot"></div>
                                    <div class="redirect-connector-dot"></div>
                                    <div class="redirect-connector-dot"></div>
                                </div>
                                <span class="redirect-brand-tag cyan">بوابة شبكتي</span>
                            </div>
                            <div class="redirect-icon-container">
                                <div class="redirect-pulse-ring"></div>
                                <div class="redirect-spinner-outer"></div>
                                <div class="redirect-spinner-inner"></div>
                                <div class="redirect-center-icon">
                                    <svg viewBox="0 0 24 24">
                                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="redirect-loading-title" id="redirectLoadingTitle"></div>
                            <div class="redirect-loading-subtitle" id="redirectLoadingSubtitle"></div>
                            <div class="redirect-progress-track">
                                <div class="redirect-progress-bar" id="redirectProgressBar"></div>
                            </div>
                            <div class="redirect-loading-footer">
                                <span class="redirect-badge-secure">
                                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                                    بوابة رسمية موثقة وآمنة
                                </span>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);
                }

                const titleEl = document.getElementById('redirectLoadingTitle');
                const subtitleEl = document.getElementById('redirectLoadingSubtitle');
                const barEl = document.getElementById('redirectProgressBar');

                if (titleEl) titleEl.innerText = title;
                if (subtitleEl) subtitleEl.innerText = subtitle;
                if (barEl) barEl.style.width = '0%';

                // Activate overlay
                overlay.classList.add('active');

                // Trigger smooth progress bar animation
                setTimeout(() => {
                    if (barEl) barEl.style.width = '100%';
                }, 60);

                // Execute navigation after satisfying smooth animation
                setTimeout(() => {
                    window.location.href = url;
                }, delay);
            };

            if (goToSignupTabBtn) {
                goToSignupTabBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    goToSignupTabBtn.style.opacity = '0.75';
                    goToSignupTabBtn.innerHTML = `
                        <span style="display:inline-flex;align-items:center;gap:7px;">
                            <span style="width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#ffd700;border-radius:50%;animation:redirectSpin 0.6s linear infinite;display:inline-block;"></span>
                            <span>جاري التوجيه...</span>
                        </span>
                    `;
                    window.showRedirectLoader({
                        url: 'https://tunisnet.shabakaty.site/auth/register',
                        title: 'جاري الانتقال لصفحة إنشاء الحساب...',
                        subtitle: 'يتم تحويلك إلى بوابة التسجيل في شبكتي لنظام النقاط والمكافآت',
                        delay: 950
                    });
                });
            }

            // Password Visibility Toggles
            function setupPasswordToggle(toggleBtn, inputField) {
                if (!toggleBtn || !inputField) return;
                toggleBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const isPass = inputField.type === 'password';
                    inputField.type = isPass ? 'text' : 'password';
                    toggleBtn.classList.toggle('active', isPass);
                    toggleBtn.innerHTML = isPass
                        ? `<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>`
                        : `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`;
                });
            }

            setupPasswordToggle(togglePointsLoginPw, pointsLoginPassword);

            // Load saved user phone if exists
            try {
                const savedPhone = localStorage.getItem('points_user_phone');
                if (savedPhone) {
                    if (pointsLoginPhone) pointsLoginPhone.value = savedPhone;
                }
            } catch (e) { }

            // Open Points Modal Handler
            if (openPointsRegisterBtn && pointsModal) {
                openPointsRegisterBtn.addEventListener('click', function () {
                    pointsModal.classList.add('active');
                    pointsModal.style.display = 'block';
                    const loginEl = document.getElementById('login');
                    if (loginEl) loginEl.classList.add('inactive');
                    if (pointsLoginAlert) pointsLoginAlert.style.display = 'none';
                });
            }

            // Close Points Modal Handler
            if (pointsModal) {
                const closeBtns = pointsModal.querySelectorAll('.app-logout, .modal-close-btn, .modal-cancel-btn');
                closeBtns.forEach(btn => {
                    btn.addEventListener('click', function (e) {
                        pointsModal.classList.remove('active');
                        pointsModal.style.display = 'none';
                        const loginEl = document.getElementById('login');
                        if (loginEl && !document.querySelector('.app.active')) {
                            loginEl.classList.remove('inactive');
                        }
                    });
                });
            }

            // Handle Login Form Submission
            if (submitPointsLoginBtn) {
                submitPointsLoginBtn.addEventListener('click', async function () {
                    const phone = pointsLoginPhone ? pointsLoginPhone.value.trim() : '';
                    const password = pointsLoginPassword ? pointsLoginPassword.value.trim() : '';
                    const errElem = document.getElementById('error');

                    if (!phone || phone.length < 6) {
                        if (errElem) {
                            errElem.innerText = 'يرجى إدخال رقم هاتف صحيح';
                            if (typeof showErrorPopup === 'function') showErrorPopup();
                        }
                        return;
                    }

                    if (!password || password.length < 4) {
                        if (errElem) {
                            errElem.innerText = 'يرجى إدخال كلمة المرور (4 أحرف/أرقام على الأقل)';
                            if (typeof showErrorPopup === 'function') showErrorPopup();
                        }
                        return;
                    }

                    const originalBtnText = submitPointsLoginBtn.innerHTML;
                    submitPointsLoginBtn.innerHTML = '<span>جاري التحقق...</span>';
                    submitPointsLoginBtn.disabled = true;

                    let loginSuccess = false;
                    let resultMsg = "";

                    if (window.LoyaltyManager && typeof window.LoyaltyManager.login === 'function') {
                        const res = await window.LoyaltyManager.login(phone, password);
                        if (res && res.success) {
                            loginSuccess = true;
                            resultMsg = res.message || "تم تسجيل الدخول لنظام النقاط بنجاح!";
                        } else {
                            loginSuccess = false;
                            resultMsg = (res && (res.error || res.message)) || "رقم الهاتف أو كلمة المرور غير صحيحة";
                        }
                    } else {
                        try {
                            localStorage.setItem('points_user_phone', phone);
                            localStorage.setItem('points_user_logged_in', 'true');
                            loginSuccess = true;
                            resultMsg = "تم تسجيل الدخول بنجاح";
                        } catch (e) { }
                    }

                    if (typeof window.updateInlinePointsElements === 'function') {
                        window.updateInlinePointsElements();
                    }

                    submitPointsLoginBtn.innerHTML = originalBtnText;
                    submitPointsLoginBtn.disabled = false;

                    if (loginSuccess) {
                        if (pointsLoginAlert) {
                            pointsLoginAlert.style.display = 'flex';
                        }

                        if (errElem) {
                            errElem.innerText = resultMsg;
                            if (typeof showErrorPopup === 'function') showErrorPopup();
                        }

                        setTimeout(() => {
                            if (pointsModal) {
                                pointsModal.classList.remove('active');
                                pointsModal.style.display = 'none';
                                const loginEl = document.getElementById('login');
                                if (loginEl && !document.querySelector('.app.active')) {
                                    loginEl.classList.remove('inactive');
                                }
                                if (pointsLoginAlert) pointsLoginAlert.style.display = 'none';
                            }
                            if (window.LoyaltyManager && typeof window.LoyaltyManager.updateUI === 'function') {
                                window.LoyaltyManager.updateUI();
                            }
                        }, 800);
                    } else {
                        if (errElem) {
                            errElem.innerText = resultMsg;
                            if (typeof showErrorPopup === 'function') showErrorPopup();
                        }
                    }
                });
            }

            // 7. BOTTOM NAV - TAB SWITCHING & HOME BUTTON
            const navHome = document.getElementById('navHome');
            if (navHome) {
                navHome.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
                    navHome.classList.add('active');
                    closeAppModal();
                });
            }

            document.querySelectorAll('.nav-item-btn[parent-id]').forEach(navBtn => {
                navBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    document.querySelectorAll('.nav-item-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    const pid = this.getAttribute('parent-id');
                    if (pid) {
                        openAppModal(pid);
                    }
                });
            });

            // 4. QR CODE CAMERA SCANNER ENGINE (2026 ULTRA-COMPATIBLE ENGINE)
            const qrScannerModal = document.getElementById('qr-scanner-modal');
            const openQrBtn = document.getElementById('openQrScannerBtn');
            const qrVideo = document.getElementById('qrVideo');
            const qrCanvas = document.getElementById('qrCanvas');
            const qrLoading = document.getElementById('qrCameraLoading');
            const qrError = document.getElementById('qrCameraError');
            const qrErrorText = document.getElementById('qrCameraErrorText');
            const qrRetryBtn = document.getElementById('qrRetryCamBtn');
            const qrTorchBtn = document.getElementById('qrTorchBtn');
            const qrTorchText = document.getElementById('qrTorchText');
            const qrSwitchCamBtn = document.getElementById('qrSwitchCameraBtn');
            const qrStatusText = document.getElementById('qrStatusText');
            const qrSuccessCard = document.getElementById('qrScanSuccessCard');
            const qrResultDisplay = document.getElementById('qrScannedResultDisplay');

            let qrMediaStream = null;
            let qrAnimationId = null;
            let currentFacingMode = 'environment';
            let isTorchActive = false;
            let isScanningActive = false;
            let barcodeDetectorInstance = null;

            // Initialize native barcode detector if available
            if ('BarcodeDetector' in window) {
                try {
                    barcodeDetectorInstance = new BarcodeDetector({ formats: ['qr_code'] });
                } catch (e) {
                    barcodeDetectorInstance = null;
                }
            }

            function playBeepSound() {
                try {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
                    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
                    gain.gain.setValueAtTime(0.2, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.25);
                } catch (e) { }
            }

            function extractCardNumberFromQR(raw) {
                if (!raw) return '';
                raw = String(raw).trim();

                // 1. Check if URL
                if (raw.startsWith('http://') || raw.startsWith('https://')) {
                    try {
                        const url = new URL(raw);
                        const params = ['username', 'user', 'card', 'code', 'u', 'pin', 'id'];
                        for (let i = 0; i < params.length; i++) {
                            if (url.searchParams.has(params[i])) {
                                const val = url.searchParams.get(params[i]);
                                if (val) return val.trim();
                            }
                        }
                        if (url.hash && url.hash.length > 1) {
                            return url.hash.substring(1).trim();
                        }
                    } catch (e) { }
                }

                // 2. Check if JSON
                if (raw.startsWith('{') && raw.endsWith('}')) {
                    try {
                        const obj = JSON.parse(raw);
                        const val = obj.username || obj.user || obj.card || obj.code || obj.pin;
                        if (val) return String(val).trim();
                    } catch (e) { }
                }

                // 3. Check for PREFIX:VALUE (e.g. USER:12345 or CARD:12345)
                const match = raw.match(/^(?:user|username|card|pin|code)[\s:=_-]+([a-zA-Z0-9_-]+)/i);
                if (match && match[1]) {
                    return match[1].trim();
                }

                return raw;
            }

            function ensureJsQr() {
                if (typeof window.jsQR === 'function' || barcodeDetectorInstance) {
                    return Promise.resolve();
                }
                return new Promise(function (resolve) {
                    var s = document.createElement('script');
                    s.src = 'js/jsqr.min.js';
                    s.async = true;
                    s.onload = resolve;
                    s.onerror = resolve;
                    document.head.appendChild(s);
                });
            }

            // Universal media stream acquisition with progressive degradation
            async function requestCameraStream(facing) {
                const constraintTiers = [
                    { video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
                    { video: { facingMode: facing }, audio: false },
                    { video: { facingMode: (facing === 'environment' ? 'user' : 'environment') }, audio: false },
                    { video: true, audio: false }
                ];

                const modernApi = navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';

                for (let i = 0; i < constraintTiers.length; i++) {
                    try {
                        if (modernApi) {
                            return await navigator.mediaDevices.getUserMedia(constraintTiers[i]);
                        }
                        const legacyGUM = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                        if (legacyGUM) {
                            return await new Promise((res, rej) => legacyGUM.call(navigator, constraintTiers[i], res, rej));
                        }
                    } catch (err) {
                        if (i === constraintTiers.length - 1) throw err;
                    }
                }
                throw new Error('متصفحك لا يدعم الوصول المباشر للكاميرا');
            }

            async function startCamera() {
                stopCamera();
                if (qrLoading) qrLoading.style.display = 'flex';
                if (qrError) qrError.style.display = 'none';
                if (qrSuccessCard) qrSuccessCard.style.display = 'none';
                if (qrStatusText) qrStatusText.textContent = 'وجه الكاميرا نحو رمز QR على الكرت';
                isScanningActive = true;

                // Load jsQR in background without delaying camera permission prompt
                ensureJsQr().catch(() => { });

                try {
                    qrMediaStream = await requestCameraStream(currentFacingMode);

                    if (qrVideo) {
                        qrVideo.muted = true;
                        qrVideo.playsInline = true;
                        qrVideo.setAttribute('playsinline', 'true');
                        qrVideo.setAttribute('webkit-playsinline', 'true');
                        qrVideo.setAttribute('muted', 'true');
                        qrVideo.setAttribute('autoplay', 'true');
                        qrVideo.srcObject = qrMediaStream;

                        // Ensure video starts playing smoothly
                        qrVideo.onloadedmetadata = function () {
                            qrVideo.play().catch(function (e) {
                                console.warn('Autoplay caught:', e);
                            });
                            if (qrLoading) qrLoading.style.display = 'none';
                        };

                        const playPromise = qrVideo.play();
                        if (playPromise !== undefined) {
                            playPromise.then(function() {
                                if (qrLoading) qrLoading.style.display = 'none';
                            }).catch(function (e) {
                                console.warn('Autoplay caught:', e);
                            });
                        }

                        qrVideo.onloadeddata = function () {
                            if (qrLoading) qrLoading.style.display = 'none';
                        };
                    }

                    // Failsafe timeout to hide loading spinner
                    setTimeout(function() {
                        if (qrLoading && isScanningActive) {
                            qrLoading.style.display = 'none';
                        }
                    }, 400);

                    // Check torch capability
                    try {
                        const track = qrMediaStream.getVideoTracks()[0];
                        if (track && track.getCapabilities && typeof track.getCapabilities === 'function') {
                            const capabilities = track.getCapabilities();
                            if (capabilities && capabilities.torch && qrTorchBtn) {
                                qrTorchBtn.style.display = 'inline-flex';
                            } else if (qrTorchBtn) {
                                qrTorchBtn.style.display = 'none';
                            }
                        }
                    } catch (e) { }

                    // Start Scan Loop
                    requestAnimationFrame(scanVideoFrame);

                } catch (err) {
                    console.warn('Camera access status:', err ? (err.message || err.name || err) : 'Error');
                    if (qrLoading) qrLoading.style.display = 'none';
                    if (qrError) {
                        qrError.style.display = 'flex';
                        if (qrErrorText) {
                            const errMsg = (err && (err.message || err.name)) ? String(err.message || err.name).toLowerCase() : '';
                            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || errMsg.includes('permission') || errMsg.includes('denied') || errMsg.includes('notallowed')) {
                                qrErrorText.textContent = 'تم رفض الإذن أو حظر الكاميرا من المتصفح. يرجى الضغط على أيقونة القفل/الإعدادات في شريط المتصفح والسماح للكاميرا ثم النقر على إعادة المحاولة.';
                            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || errMsg.includes('notfound')) {
                                qrErrorText.textContent = 'لم يتم العثور على جهاز كاميرا متصل.';
                            } else {
                                qrErrorText.textContent = 'تعذر تشغيل الكاميرا حالياً. يرجى التأكد من صلاحيات المتصفح ثم إعادة المحاولة.';
                            }
                        }
                    }
                }
            }

            // Expose globally
            window.startCamera = startCamera;
            window.stopCamera = stopCamera;

            async function scanVideoFrame() {
                if (!isScanningActive || !qrVideo) return;

                if (qrVideo.readyState < 2) {
                    if (isScanningActive) {
                        qrAnimationId = requestAnimationFrame(scanVideoFrame);
                    }
                    return;
                }

                // If loading is still visible, hide it now
                if (qrLoading && qrLoading.style.display !== 'none') {
                    qrLoading.style.display = 'none';
                }

                let detectedCode = null;

                // Priority 1: Native Hardware BarcodeDetector
                if (barcodeDetectorInstance) {
                    try {
                        const barcodes = await barcodeDetectorInstance.detect(qrVideo);
                        if (barcodes && barcodes.length > 0) {
                            detectedCode = barcodes[0].rawValue;
                        }
                    } catch (e) { }
                }

                // Priority 2: jsQR Canvas Decoding (Fast captive portal safe engine)
                if (!detectedCode && typeof window.jsQR === 'function' && qrCanvas && qrVideo.videoWidth > 0) {
                    try {
                        const ctx = qrCanvas.getContext('2d', { willReadFrequently: true });
                        if (ctx) {
                            const w = Math.min(qrVideo.videoWidth, 640);
                            const h = Math.round(w * (qrVideo.videoHeight / qrVideo.videoWidth));
                            qrCanvas.width = w;
                            qrCanvas.height = h;
                            ctx.drawImage(qrVideo, 0, 0, w, h);
                            const imageData = ctx.getImageData(0, 0, w, h);
                            const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
                                inversionAttempts: "dontInvert"
                            });
                            if (code && code.data) {
                                detectedCode = code.data;
                            }
                        }
                    } catch (e) { }
                }

                if (detectedCode) {
                    handleSuccessfulQrScan(detectedCode);
                    return;
                }

                if (isScanningActive) {
                    qrAnimationId = requestAnimationFrame(scanVideoFrame);
                }
            }

            function handleSuccessfulQrScan(rawData) {
                isScanningActive = false;
                const cleanCard = extractCardNumberFromQR(rawData);

                playBeepSound();
                if (navigator.vibrate) {
                    try { navigator.vibrate([80, 40, 80]); } catch (e) { }
                }

                if (qrSuccessCard && qrResultDisplay) {
                    qrResultDisplay.textContent = cleanCard;
                    qrSuccessCard.style.display = 'flex';
                }

                // Auto-fill username field in login form
                const usernameInput = document.querySelector('input[name="username"]') || document.querySelector('input[username-field]');
                if (usernameInput) {
                    usernameInput.value = cleanCard;
                    usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                    usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Auto-close modal after brief visual confirmation
                setTimeout(function() {
                    stopCamera();
                    var closeBtn = document.getElementById('closeQrScannerBtn');
                    if (closeBtn) {
                        closeBtn.click();
                    } else {
                        var logoutBtn = qrScannerModal ? qrScannerModal.querySelector('.app-logout') : null;
                        if (logoutBtn) logoutBtn.click();
                    }
                }, 600);
            }

            function stopCamera() {
                isScanningActive = false;
                if (qrAnimationId) {
                    cancelAnimationFrame(qrAnimationId);
                    qrAnimationId = null;
                }
                if (qrMediaStream) {
                    qrMediaStream.getTracks().forEach(function(track) {
                        try { track.stop(); } catch (e) { }
                    });
                    qrMediaStream = null;
                }
                if (qrVideo) {
                    qrVideo.srcObject = null;
                }
                isTorchActive = false;
                if (qrTorchText) qrTorchText.textContent = 'الكشاف';
            }

            // Open QR Scanner button click & immediate camera initialization
            // IMPORTANT: startCamera() must be called BEFORE openAppModal to keep the
            // getUserMedia call within the direct user-gesture activation chain.
            if (openQrBtn) {
                const handleOpenQr = function (e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    // Request camera FIRST (still inside user gesture), then open modal UI
                    startCamera();
                    openAppModal('qr-scanner-modal');
                };
                openQrBtn.addEventListener('click', handleOpenQr);
            }

            // Switch Camera
            if (qrSwitchCamBtn) {
                qrSwitchCamBtn.addEventListener('click', function () {
                    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
                    startCamera();
                });
            }

            // Torch Toggle
            if (qrTorchBtn) {
                qrTorchBtn.addEventListener('click', async function () {
                    if (!qrMediaStream) return;
                    const track = qrMediaStream.getVideoTracks()[0];
                    if (track && track.applyConstraints) {
                        try {
                            isTorchActive = !isTorchActive;
                            await track.applyConstraints({
                                advanced: [{ torch: isTorchActive }]
                            });
                            if (qrTorchText) {
                                qrTorchText.textContent = isTorchActive ? 'إطفاء الكشاف' : 'الكشاف';
                            }
                        } catch (e) {
                            console.error('Torch error:', e);
                        }
                    }
                });
            }

            // System Camera Capture Fallback elements
            const qrSystemCamFallbackBtn = document.getElementById('qrSystemCamFallbackBtn');
            const qrSystemCameraInput = document.getElementById('qrSystemCameraInput');

            // Decode QR Code from Native Camera Snapshot (Multi-Scale & ES5 Compatible)
            function decodeQrFromImageFile(file) {
                if (!file) return;
                if (qrLoading) {
                    qrLoading.style.display = 'flex';
                    var span = qrLoading.querySelector('span');
                    if (span) span.textContent = 'جاري قراءة الرمز بدقة...';
                }
                if (qrError) qrError.style.display = 'none';

                var processImage = function() {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var img = new Image();
                        img.onload = function () {
                            var detectedCode = null;

                            function tryDecode(scaleMax) {
                                if (detectedCode) return;
                                if (typeof window.jsQR !== 'function') return;

                                var c = qrCanvas || document.createElement('canvas');
                                var ctx = c.getContext('2d', { willReadFrequently: true });
                                
                                var w = img.naturalWidth || img.width;
                                var h = img.naturalHeight || img.height;

                                if (scaleMax && (w > scaleMax || h > scaleMax)) {
                                    if (w > h) {
                                        h = Math.round((h * scaleMax) / w);
                                        w = scaleMax;
                                    } else {
                                        w = Math.round((w * scaleMax) / h);
                                        h = scaleMax;
                                    }
                                }

                                c.width = w;
                                c.height = h;
                                
                                // Improve resizing interpolation
                                ctx.imageSmoothingEnabled = true;
                                ctx.imageSmoothingQuality = 'high';
                                ctx.drawImage(img, 0, 0, w, h);
                                
                                var imgData = ctx.getImageData(0, 0, w, h);
                                var code = window.jsQR(imgData.data, imgData.width, imgData.height, {
                                    inversionAttempts: "attemptBoth"
                                });
                                
                                if (code && code.data) {
                                    detectedCode = code.data;
                                }
                            }

                            // 1. Try Native BarcodeDetector (Modern Androids)
                            if (barcodeDetectorInstance) {
                                try {
                                    barcodeDetectorInstance.detect(img).then(function(barcodes) {
                                        if (barcodes && barcodes.length > 0) {
                                            detectedCode = barcodes[0].rawValue;
                                        }
                                        finishDecoding();
                                    }).catch(function() {
                                        finishDecoding();
                                    });
                                    return;
                                } catch (err) { }
                            }

                            finishDecoding();

                            function finishDecoding() {
                                // 2. Try Original Size (Best for screens)
                                tryDecode(null);
                                // 3. Try 800px (Best for printed paper closeups)
                                tryDecode(800);
                                // 4. Try 400px (Best for blurry scans)
                                tryDecode(400);

                                if (qrLoading) qrLoading.style.display = 'none';

                                if (detectedCode) {
                                    handleSuccessfulQrScan(detectedCode);
                                } else {
                                    if (qrError) {
                                        qrError.style.display = 'flex';
                                        if (qrErrorText) {
                                            qrErrorText.textContent = 'الصورة غير واضحة للبرنامج أو الانعكاس قوي جداً. حاول تقريب الكاميرا ليكون المربع الأسود واضحاً ومستوياً.';
                                        }
                                    }
                                }
                            }
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                };

                if (typeof window.jsQR !== 'function') {
                    ensureJsQr().then(processImage).catch(processImage);
                } else {
                    processImage();
                }
            }

            // Fallback Native Camera button trigger
            if (qrSystemCamFallbackBtn && qrSystemCameraInput) {
                qrSystemCamFallbackBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    qrSystemCameraInput.click();
                });
            }

            if (qrSystemCameraInput) {
                qrSystemCameraInput.addEventListener('change', function (e) {
                    if (e.target.files && e.target.files[0]) {
                        decodeQrFromImageFile(e.target.files[0]);
                    }
                });
            }

            // Retry Camera
            if (qrRetryBtn) {
                qrRetryBtn.addEventListener('click', function () {
                    startCamera();
                });
            }

            // Stop camera on modal close / logout
            if (qrScannerModal) {
                var closeBtns = qrScannerModal.querySelectorAll('.modal-close-btn, .modal-cancel-btn, .app-logout');
                closeBtns.forEach(function(btn) {
                    btn.addEventListener('click', function () {
                        stopCamera();
                    });
                });
            }

            // 5. DIRECT FILL PREVIOUS CARD BUTTON (دخول بكرت سابق)
            const prevCardBtn = document.getElementById('quickPreviousCardBtn');
            let prevCardCycleIndex = 0;

            if (prevCardBtn) {
                prevCardBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Collect all previous cards stored in cookies, localStorage, or memory
                    let cardsList = [];

                    // From hotCookie stored values
                    if (typeof getStoredValuesFromCookie === 'function') {
                        const rawStored = getStoredValuesFromCookie();
                        if (Array.isArray(rawStored)) {
                            // Reverse to get most recent first
                            rawStored.slice().reverse().forEach(function(item) {
                                if (item) {
                                    var parts = item.toString().split(',');
                                    var cardNum = parts[0] ? parts[0].trim() : '';
                                    if (cardNum && !cardsList.includes(cardNum)) {
                                        cardsList.push(cardNum);
                                    }
                                }
                            });
                        }
                    }

                    // From single cookie username
                    if (typeof getLoginCardCookie === 'function') {
                        const loginCookie = getLoginCardCookie();
                        if (loginCookie && loginCookie.username) {
                            const u = loginCookie.username.trim();
                            if (u && !cardsList.includes(u)) {
                                cardsList.push(u);
                            }
                        }
                    }

                    // From localStorage backups
                    try {
                        const rawLocal = localStorage.getItem('storedValues');
                        if (rawLocal) {
                            const parsed = JSON.parse(rawLocal);
                            if (Array.isArray(parsed)) {
                                parsed.slice().reverse().forEach(function(item) {
                                    var card = item.toString().split(',')[0].trim();
                                    if (card && !cardsList.includes(card)) {
                                        cardsList.push(card);
                                    }
                                });
                            }
                        }
                        const singleLocal = localStorage.getItem('last_user_card') || localStorage.getItem('username');
                        if (singleLocal && !cardsList.includes(singleLocal.trim())) {
                            cardsList.push(singleLocal.trim());
                        }
                    } catch (err) { }

                    const usernameInput = document.querySelector('input[name="username"]') || document.querySelector('input[username-field]');

                    if (cardsList.length > 0) {
                        const selectedCard = cardsList[prevCardCycleIndex % cardsList.length];
                        prevCardCycleIndex++;

                        if (usernameInput) {
                            usernameInput.value = selectedCard;
                            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
                            usernameInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        // Success button feedback
                        prevCardBtn.classList.add('flash-success');
                        setTimeout(function() {
                            prevCardBtn.classList.remove('flash-success');
                        }, 500);

                        if (navigator.vibrate) {
                            try { navigator.vibrate(50); } catch (err) { }
                        }
                    } else {
                        const errEl = document.getElementById('error');
                        if (errEl) {
                            errEl.innerText = 'لا يوجد كرت سابق محفوظ في هذا المتصفح';
                            if (typeof showErrorPopup === 'function') {
                                showErrorPopup();
                            }
                        }
                    }
                });
            }

            // Save entered username to stored history and localStorage
            const usernameInputField = document.querySelector('input[name="username"]') || document.querySelector('input[username-field]');
            if (usernameInputField) {
                const persistCard = function () {
                    const val = usernameInputField.value ? usernameInputField.value.trim() : '';
                    if (val.length > 1) {
                        try {
                            localStorage.setItem('last_user_card', val);
                            if (typeof saveValueToCookie === 'function') {
                                saveValueToCookie(val, '');
                            }
                        } catch (err) { }
                    }
                };
                usernameInputField.addEventListener('blur', persistCard);
                usernameInputField.addEventListener('change', persistCard);
            }

            if (document.login) {
                document.login.addEventListener('submit', function () {
                    const uInput = document.login.querySelector('input[username-field]') || document.querySelector('input[name="username"]');
                    if (uInput && uInput.value && uInput.value.trim().length > 1) {
                        try {
                            const val = uInput.value.trim();
                            localStorage.setItem('last_user_card', val);
                            if (typeof saveValueToCookie === 'function') {
                                saveValueToCookie(val, '');
                            }
                        } catch (err) { }
                    }
                });
            }

            // 6. UNIVERSAL WHATSAPP INTENT DISPATCHER (WHATSAPP & WHATSAPP BUSINESS)
            const waButtons = document.querySelectorAll('.support-btn-whatsapp');

            waButtons.forEach(function(btn) {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();

                    const activeCfg = window.hotspotConfig || {};
                    const rawPhone = (activeCfg['service-number'] || '772131004').toString().replace(/\D/g, '');
                    const waPhone = rawPhone.startsWith('967') ? rawPhone : ('967' + rawPhone);
                    const netName = (activeCfg['network-name'] || 'تونس نت').toString().trim();
                    const waMsg = encodeURIComponent('مرحبا خدمة عملاء شبكة ' + netName + ' اللاسلكية');
                    const waSchemeUrl = `whatsapp://send?phone=${waPhone}&text=${waMsg}`;
                    const waWebUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${waMsg}`;

                    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isMobile) {
                        // Trigger universal mobile URI scheme (Prompts Android "Complete action using" if both are installed)
                        const start = Date.now();
                        window.location.href = waSchemeUrl;

                        // Fallback to web link if neither app is installed
                        setTimeout(function () {
                            const elapsed = Date.now() - start;
                            if (elapsed < 2000 && !document.hidden && !document.webkitHidden) {
                                window.location.href = waWebUrl;
                            }
                        }, 1400);
                    } else {
                        // Desktop browser -> Open WhatsApp Web directly
                        window.open(waWebUrl, '_blank', 'noopener,noreferrer');
                    }
                });
            });

            // 7. AUTO-HIDE TOAST ON POPUP
            var toastContainer = document.querySelector('.error-container');
            if (toastContainer) {
                var toastObserver = new MutationObserver(function() {
                    if (toastContainer.classList.contains('active')) {
                        setTimeout(function() {
                            if (typeof hideErrorPopup === 'function') {
                                hideErrorPopup();
                            }
                        }, 4000);
                    }
                });
                toastObserver.observe(toastContainer, { attributes: true, attributeFilter: ['class'] });
            }

            // 8. MOBILE KEYBOARD DETECTION: PREVENT BOTTOM BAR FROM RISING ABOVE KEYBOARD (TEXT INPUTS ONLY)
            const bNav = document.getElementById('bottomNav');
            let keyboardTimer = null;

            function isTextualKeyboardInput(el) {
                if (!el || !el.tagName) return false;
                const tag = el.tagName.toUpperCase();
                if (tag === 'TEXTAREA') return true;
                if (el.isContentEditable) return true;
                if (tag === 'INPUT') {
                    const type = (el.type || 'text').toLowerCase();
                    return ['text', 'password', 'number', 'tel', 'email', 'search', 'url'].includes(type);
                }
                return false;
            }

            function hideBottomNavOnKeyboard() {
                clearTimeout(keyboardTimer);
                document.body.classList.add('keyboard-open');
                if (bNav) {
                    bNav.classList.add('hidden-keyboard');
                }
            }

            function restoreBottomNavOnBlur() {
                clearTimeout(keyboardTimer);
                keyboardTimer = setTimeout(function() {
                    var activeElement = document.activeElement;
                    if (!isTextualKeyboardInput(activeElement)) {
                        document.body.classList.remove('keyboard-open');
                        if (bNav) {
                            bNav.classList.remove('hidden-keyboard');
                        }
                    }
                }, 100);
            }

            // Listen to focus / blur globally only for text-entry fields (avoids hiding on checkboxes/toggles/switches)
            document.addEventListener('focusin', function (e) {
                if (isTextualKeyboardInput(e.target)) {
                    hideBottomNavOnKeyboard();
                }
            });

            document.addEventListener('focusout', function (e) {
                if (isTextualKeyboardInput(e.target)) {
                    restoreBottomNavOnBlur();
                }
            });

            // Handle visual viewport shrink (Android & iOS virtual keyboard open/close)
            if (window.visualViewport) {
                const originalVpHeight = window.visualViewport.height;
                window.visualViewport.addEventListener('resize', function () {
                    const currentHeight = window.visualViewport.height;
                    // If viewport height drops significantly AND active element is a text input, virtual keyboard is active
                    if (isTextualKeyboardInput(document.activeElement) && (currentHeight < originalVpHeight - 120 || currentHeight < window.innerHeight * 0.78)) {
                        hideBottomNavOnKeyboard();
                    } else if (!isTextualKeyboardInput(document.activeElement)) {
                        restoreBottomNavOnBlur();
                    }
                });
            }
            // 9. AUTOMATIC SCROLL-TO-TOP ON PAGE TRANSITIONS & SUCCESSFUL LOGIN
            function resetWindowScrollToTop() {
                try {
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                } catch (e) {
                    window.scrollTo(0, 0);
                }
                if (document.documentElement) document.documentElement.scrollTop = 0;
                if (document.body) document.body.scrollTop = 0;
                if (document.scrollingElement) document.scrollingElement.scrollTop = 0;

                var scrollNodes = document.querySelectorAll('.app, .app-container, .main, #container, .container, body, html');
                scrollNodes.forEach(function(el) {
                    if (el && el.scrollTop > 0) el.scrollTop = 0;
                });
            }
            window.resetWindowScrollToTop = resetWindowScrollToTop;

            // Scroll to the top when entering status is already handled by
            // showParentElement(). Do not observe every #status style change:
            // doing so reset scrollTop repeatedly and made long pages unscrollable.

            // Hook on login form submission & keyboard "Go" / "Enter" key
            if (document.login) {
                const usernameInput = document.login.querySelector("input[name='username']");
                if (usernameInput) {
                    usernameInput.addEventListener('keydown', function (e) {
                        if (e.key === 'Enter' || e.keyCode === 13) {
                            e.preventDefault();
                            const mainBtn = document.getElementById('mainLoginBtn') || document.querySelector('.login-submit');
                            if (mainBtn) {
                                mainBtn.click();
                            } else if (typeof onLoginSubmitted === 'function') {
                                onLoginSubmitted();
                            }
                        }
                    });
                }

                document.login.addEventListener('submit', function (e) {
                    e.preventDefault();
                    const mainBtn = document.getElementById('mainLoginBtn') || document.querySelector('.login-submit');
                    if (mainBtn) {
                        mainBtn.click();
                    } else if (typeof onLoginSubmitted === 'function') {
                        onLoginSubmitted();
                    }
                    setTimeout(resetWindowScrollToTop, 100);
                    setTimeout(resetWindowScrollToTop, 350);
                });
            }

            // Reset on page show or hashchange
            window.addEventListener('pageshow', resetWindowScrollToTop);
            window.addEventListener('hashchange', resetWindowScrollToTop);
        });

        // Friday Greeting Check
        var e, m = new Date().toDateString();
        if (m.includes('Fri')) {
            e = document.getElementById('error');
            if (e) {
                e.innerText = "جمعة مباركة";
                if (typeof showErrorPopup === 'function') {
                    showErrorPopup();
                }
            }
        }

        // =========================================================================
        // AUTOMATIC DYNAMIC MARQUEE SPEED & EXACT BOUNDARIES ENGINE (FLICKER-FREE)
        // =========================================================================
        (function initAutoDynamicMarquee() {
            let lastAppliedKey = '';
            let isCalculating = false;

            function setupMarquee() {
                if (isCalculating) return;
                const track = document.querySelector('.ticker-content-track');
                const marquee = document.querySelector('.marquee');
                if (!track || !marquee) return;

                const text = (marquee.textContent || marquee.innerText || '').trim();
                if (!text || text.includes('{{news-line}}')) return;

                isCalculating = true;

                // Measure track and text width without resetting animation
                const trackWidth = track.clientWidth || track.offsetWidth || 380;
                const textWidth = marquee.scrollWidth || marquee.offsetWidth || 1000;

                // Exact pixel coordinates:
                // Start: Right edge aligns with track left boundary (first letter enters immediately)
                const startX = -(trackWidth + 6);
                // End: Left edge fully clears track right boundary (last letter exits completely)
                const endX = textWidth + 16;
                const totalDistance = endX - startX;

                // Constant readable velocity (52px per second regardless of text length)
                const PIXELS_PER_SECOND = 52;
                const duration = Math.max(6, (totalDistance / PIXELS_PER_SECOND)).toFixed(2);

                const cacheKey = `${startX}_${endX}_${duration}_${text.length}`;
                if (lastAppliedKey === cacheKey) {
                    isCalculating = false;
                    return; // No layout change -> Do NOT disturb running animation
                }

                lastAppliedKey = cacheKey;

                let dynamicStyle = document.getElementById('dynamic-marquee-engine-style');
                if (!dynamicStyle) {
                    dynamicStyle = document.createElement('style');
                    dynamicStyle.id = 'dynamic-marquee-engine-style';
                    document.head.appendChild(dynamicStyle);
                }

                dynamicStyle.textContent = `
                    @keyframes marqueeDynamic {
                        0% { transform: translate3d(${startX}px, 0, 0); }
                        100% { transform: translate3d(${endX}px, 0, 0); }
                    }
                    .marquee {
                        animation: marqueeDynamic ${duration}s linear infinite !important;
                    }
                `;

                isCalculating = false;
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', setupMarquee);
            } else {
                setupMarquee();
            }

            window.addEventListener('load', setupMarquee, { passive: true });

            let resizeDebounce = null;
            window.addEventListener('resize', function () {
                clearTimeout(resizeDebounce);
                resizeDebounce = setTimeout(setupMarquee, 150);
            }, { passive: true });

            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(setupMarquee);
            }

            const marqueeEl = document.querySelector('.marquee');
            if (marqueeEl) {
                let mutationDebounce = null;
                const observer = new MutationObserver(function () {
                    clearTimeout(mutationDebounce);
                    mutationDebounce = setTimeout(setupMarquee, 60);
                });
                observer.observe(marqueeEl, { childList: true, characterData: true, subtree: true });
            }
        })();

        // The ring percentage is updated by onStatusQuery only when MikroTik
        // supplies both the remaining bytes and the configured total byte limit.
        // Do not infer a percentage from this session's upload/download counters.

    