document.addEventListener('DOMContentLoaded', () => {

    const bgMusic = document.getElementById('bgMusic');
    const audioToggle = document.getElementById('audioToggle');

    // Initialize play state based on element (autoplay muted may be playing)
    let isPlaying = !!(bgMusic && !bgMusic.paused && !bgMusic.muted);
    if (audioToggle) {
        audioToggle.textContent = isPlaying ? '⏸ Stop Music' : '♫ Play Music';
    }

    audioToggle.addEventListener('click', () => {
        if (!bgMusic) return;
        if (isPlaying) {
            bgMusic.pause();
            // state will update on 'pause' event
        } else {
            // Unmute then try to play. Play() returns a promise on modern browsers.
            bgMusic.muted = false;
            const p = bgMusic.play();
            if (p && typeof p.then === 'function') {
                p.then(() => {
                    isPlaying = true;
                    if (audioToggle) audioToggle.textContent = '⏸ Stop Music';
                }).catch((err) => {
                    // Playback failed (autoplay or other). Keep muted toggle as fallback.
                    console.warn('Audio play failed:', err);
                    isPlaying = !bgMusic.paused;
                    if (audioToggle) audioToggle.textContent = isPlaying ? '⏸ Stop Music' : '♫ Play Music';
                });
            } else {
                // Older browsers: assume play started
                isPlaying = true;
                if (audioToggle) audioToggle.textContent = '⏸ Stop Music';
            }
        }
    });

    bgMusic.addEventListener('play', () => {
        isPlaying = true;
        if (audioToggle && !bgMusic.muted) audioToggle.textContent = '⏸ Stop Music';
    });

    bgMusic.addEventListener('pause', () => {
        isPlaying = false;
        if (audioToggle) audioToggle.textContent = '♫ Play Music';
    });

    const customMessage = document.getElementById('customMessage');
    const updateLetter = document.getElementById('updateLetter');
    const letterMessage = document.getElementById('letterMessage');
    const recipientName = document.getElementById('recipientName');
    const senderName = document.getElementById('senderName');
    const recipientInput = document.getElementById('recipientInput');
    const senderInput = document.getElementById('senderInput');

    updateLetter.addEventListener('click', () => {
        const message = customMessage.value.trim();
        const newRecipient = recipientInput.value.trim() || 'You';
        const newSender = senderInput.value.trim() || 'Shreepson';
        
        if (message) {
            letterMessage.textContent = message;
            recipientName.textContent = newRecipient;
            senderName.textContent = newSender;
            customMessage.value = '';
            recipientInput.value = '';
            senderInput.value = '';
            animateElement(letterMessage);
            showNotification('Letter updated! 💌');
        } else {
            showNotification('Please write a message first', 'warning');
        }
    });

    customMessage.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            updateLetter.click();
        }
    });
    const messageModal = document.getElementById('messageModal');
    const modalImage = document.getElementById('modalImage');
    const modalMessage = document.getElementById('modalMessage');
    const modalCurrentCaption = document.getElementById('modalCurrentCaption');
    const modalImageUpload = document.getElementById('modalImageUpload');
        const closeModal = document.getElementById('closeModal');
        try { styleTitleEdit.focus(); } catch (err) { /* ignore */ }
    const modalClose = document.getElementById('modalClose');
    const modalSend = document.getElementById('modalSend');

    let currentEditingIndex = -1; // Track which gallery item is being edited

    // Elements for uploader
    const galleryUpload = document.getElementById('galleryUpload');
    const galleryCaption = document.getElementById('galleryCaption');
    const addGalleryBtn = document.getElementById('addGalleryBtn');
    const galleryGrid = document.getElementById('galleryGrid');

    // Load and render gallery from localStorage
    function loadMoments() {
        try { return JSON.parse(localStorage.getItem('momentsOfLove') || '[]'); } catch { return []; }
    }

    function saveMoments(items) { localStorage.setItem('momentsOfLove', JSON.stringify(items)); }

    // Render gallery items (initial defaults + user uploads)
    function renderGallery() {
        const defaults = [
            { src: 'img/Untitled.jpg', caption: 'Sweet Moments', message: "You're wonderful ❤️" },
            { src: 'img/Heart.jpg', caption: 'Hearts Content', message: 'Be my Valentine 💕' },
            { src: 'img/sunny.jpg', caption: 'True Love', message: 'Forever Yours 💖' },
            { src: 'img/happy.jpg', caption: 'Joy & Laughter', message: 'You make me smile 😊' },
            { src: 'img/babu.jpg', caption: 'Cherished Memories', message: 'Always with you 💝' }
        ];

        const stored = loadMoments();
        const items = defaults.slice();
        const itemToStoredIdx = new Array(items.length).fill(-1);
        stored.forEach((s, si) => {
            if (s && typeof s.replaceIndex === 'number' && s.replaceIndex >= 0 && s.replaceIndex < defaults.length) {
                items[s.replaceIndex] = { src: s.src || defaults[s.replaceIndex].src, caption: s.caption || defaults[s.replaceIndex].caption, message: s.message || defaults[s.replaceIndex].message };
                itemToStoredIdx[s.replaceIndex] = si;
            } else {
                itemToStoredIdx.push(si);
                items.push(s);
            }
        });

        galleryGrid.innerHTML = '';

        items.forEach((it, idx) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.setAttribute('data-index', idx);
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumb';
            thumb.style.cssText = 'width:220px;height:150px;overflow:hidden;border-radius:10px;box-shadow:0 8px 18px rgba(0,0,0,0.08);';
            const img = document.createElement('img');
            img.className = 'vintage-photo romantic-example-photo';
            img.setAttribute('data-message', escapeHtml(it.message || ''));
            img.setAttribute('data-caption', escapeHtml(it.caption || ''));
            img.setAttribute('data-idx', idx);
            const mappedStored = (typeof itemToStoredIdx !== 'undefined' && itemToStoredIdx[idx] !== undefined) ? itemToStoredIdx[idx] : -1;
            img.setAttribute('data-stored-idx', mappedStored);
            img.src = escapeHtml(it.src || '');
            img.alt = 'gallery';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            thumb.appendChild(img);
            item.appendChild(thumb);
            const caption = document.createElement('p');
            caption.className = 'photo-caption';
            caption.textContent = it.caption || '';
            item.appendChild(caption);
            galleryGrid.appendChild(item);
        });
    }

    function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    // Handle clicks on gallery images using event delegation
    galleryGrid.addEventListener('click', (e) => {
        const img = e.target.closest('.vintage-photo');
        if (!img) return;
        
        const idxAttr = img.getAttribute('data-idx');
        const idx = Number.isFinite ? parseInt(idxAttr, 10) : parseInt(idxAttr);
        if (Number.isNaN(idx)) return;
        currentEditingIndex = idx;
        
        const caption = img.getAttribute('data-caption') || '-';
        const message = img.getAttribute('data-message') || '';
        
        if (modalImage) modalImage.src = img.src;
        if (modalCurrentCaption) modalCurrentCaption.textContent = caption;
        if (modalMessage) modalMessage.value = message;
        if (modalImageUpload) modalImageUpload.value = ''; // Reset file input
        if (messageModal) {
            messageModal.classList.add('show');
        }
        animateElement(messageModal);

        // Wire Change Photo button and allow clicking the modal image to replace the picture
        const modalChangeBtn = document.getElementById('modalChangeBtn');
        if (modalChangeBtn && modalImageUpload) {
            modalChangeBtn.onclick = () => modalImageUpload.click();
            modalChangeBtn.style.display = 'inline-block';
        }
        if (modalImage && modalImageUpload) {
            modalImage.style.cursor = 'pointer';
            modalImage.onclick = () => modalImageUpload.click();
        }
    });

    // Handle image replacement in modal (only if the input exists)
    if (modalImageUpload) {
        modalImageUpload.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file');
                return;
            }
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                if (modalImage) modalImage.src = dataUrl;
                showNotification('Image preview updated');

                // Immediately apply change to the clicked gallery item and persist
                try {
                    const imgEl = document.querySelector('.gallery-item [data-idx="' + currentEditingIndex + '"]');
                    if (imgEl) {
                        imgEl.src = dataUrl;
                        // update stored moments accordingly
                        const stored = loadMoments();
                        const storedIdxAttr = imgEl.getAttribute('data-stored-idx');
                        const sIdx = storedIdxAttr !== null ? parseInt(storedIdxAttr, 10) : -1;
                        if (!Number.isNaN(sIdx) && sIdx >= 0 && sIdx < stored.length) {
                            stored[sIdx].src = dataUrl;
                        } else {
                            // create replacement for default at this index
                            const defaults = [
                                { src: 'img/Untitled.jpg', caption: 'Sweet Moments', message: "You're wonderful ❤️" },
                                { src: 'img/Heart.jpg', caption: 'Hearts Content', message: 'Be my Valentine 💕' },
                                { src: 'img/sunny.jpg', caption: 'True Love', message: 'Forever Yours 💖' },
                                { src: 'img/happy.jpg', caption: 'Joy & Laughter', message: 'You make me smile 😊' },
                                { src: 'img/babu.jpg', caption: 'Cherished Memories', message: 'Always with you 💝' }
                            ];
                            const base = defaults[currentEditingIndex] || { src: '', caption: '', message: '' };
                            stored.push({ src: dataUrl, caption: base.caption, message: base.message, replaceIndex: currentEditingIndex });
                        }
                        saveMoments(stored);
                        renderGallery();
                        showNotification('Image applied to gallery');
                    }
                } catch (err) {
                    console.error('apply image error', err);
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // Modal close handlers
    closeModal.addEventListener('click', () => { messageModal.classList.remove('show'); });
    modalClose.addEventListener('click', () => { messageModal.classList.remove('show'); });
    messageModal.addEventListener('click', (e) => { if (e.target === messageModal) messageModal.classList.remove('show'); });

    if (modalSend) {
        modalSend.addEventListener('click', async () => {
            const caption = modalMessage ? modalMessage.value.trim() : '';
            
            if (currentEditingIndex >= 0) {
                const defaults = [
                    { src: 'img/Untitled.jpg', caption: 'Sweet Moments', message: "You're wonderful ❤️" },
                    { src: 'img/Heart.jpg', caption: 'Hearts Content', message: 'Be my Valentine 💕' },
                    { src: 'img/sunny.jpg', caption: 'True Love', message: 'Forever Yours 💖' },
                    { src: 'img/happy.jpg', caption: 'Joy & Laughter', message: 'You make me smile 😊' },
                    { src: 'img/babu.jpg', caption: 'Cherished Memories', message: 'Always with you 💝' }
                ];

                const stored = loadMoments();
                const file = modalImageUpload && modalImageUpload.files && modalImageUpload.files[0];
                const imgEl = document.querySelector('.gallery-item [data-idx="' + currentEditingIndex + '"]');
                const dataStoredIdx = imgEl ? parseInt(imgEl.getAttribute('data-stored-idx'), 10) : NaN;
                const storedIndex = Number.isFinite(dataStoredIdx) ? dataStoredIdx : -1;

                let newSrc = null;
                if (file) {
                    try {
                        newSrc = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = (evt) => resolve(evt.target.result);
                            reader.onerror = () => reject(new Error('read error'));
                            reader.readAsDataURL(file);
                        });
                    } catch (err) {
                        showNotification('Error reading image', 'error');
                        return;
                    }
                }

                if (storedIndex >= 0) {
                    if (newSrc) stored[storedIndex].src = newSrc;
                    if (caption) { stored[storedIndex].message = caption; stored[storedIndex].caption = caption; }
                } else {
                    const base = defaults[currentEditingIndex] || { src: '', caption: '', message: '' };
                    const created = {
                        src: newSrc || base.src,
                        caption: caption || base.caption,
                        message: caption || base.message,
                        replaceIndex: currentEditingIndex
                    };
                    stored.push(created);
                }

                saveMoments(stored);
                renderGallery();
                showNotification('✨ Moment updated successfully!');
            }
            
            if (messageModal) messageModal.classList.remove('show');
            if (modalMessage) modalMessage.value = '';
            if (modalImageUpload) modalImageUpload.value = '';
            if (modalCurrentCaption) modalCurrentCaption.textContent = '-';
            currentEditingIndex = -1;
        });
    }

    // Gallery uploader UX: preview, clear, add
    const galleryPreview = document.getElementById('galleryPreview');
    const galleryClearBtn = document.getElementById('galleryClearBtn');

    galleryUpload.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            if (galleryPreview) { galleryPreview.style.display = 'none'; galleryPreview.src = ''; }
            addGalleryBtn.disabled = true;
            if (galleryClearBtn) galleryClearBtn.style.display = 'none';
            return;
        }
        if (!file.type.startsWith('image/')) {
            showNotification('Please choose a valid image file.');
            galleryUpload.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (evt) => {
            if (galleryPreview) {
                galleryPreview.src = evt.target.result;
                galleryPreview.style.display = 'block';
            }
            addGalleryBtn.disabled = false;
            if (galleryClearBtn) galleryClearBtn.style.display = 'inline-block';
        };
        reader.readAsDataURL(file);
    });

    galleryClearBtn?.addEventListener('click', () => {
        galleryUpload.value = '';
        if (galleryPreview) { galleryPreview.src = ''; galleryPreview.style.display = 'none'; }
        galleryCaption.value = '';
        addGalleryBtn.disabled = true;
        galleryClearBtn.style.display = 'none';
    });

    addGalleryBtn.addEventListener('click', () => {
        const file = galleryUpload.files && galleryUpload.files[0];
        const caption = galleryCaption.value.trim() || 'Shared Moment';
        if (!file) return showNotification('Please choose an image to add.');
        if (!file.type.startsWith('image/')) return showNotification('Please choose a valid image file.');

        const reader = new FileReader();
        reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            const moments = loadMoments();
            moments.unshift({ src: dataUrl, caption: caption, message: caption });
            saveMoments(moments);
            galleryUpload.value = '';
            galleryCaption.value = '';
            if (galleryPreview) { galleryPreview.src = ''; galleryPreview.style.display = 'none'; }
            addGalleryBtn.disabled = true;
            if (galleryClearBtn) galleryClearBtn.style.display = 'none';
            renderGallery();
            showNotification('Image added to Moments of Love! 💕');
        };
        reader.readAsDataURL(file);
    });
    renderGallery();
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const emoji = btn.textContent;
            modalMessage.value += emoji;
            animateElement(btn);
        });
    });

    // =====  GAME CONTROLS =====
    const quizToggle = document.getElementById('quizToggle');
    const quizModal = document.getElementById('quizModal');
    const closeQuizModal = document.getElementById('closeQuizModal');

    // Game elements
    const gameStart = document.getElementById('gameStart');
    const gameStartBtn = document.getElementById('gameStartBtn');
    const gameHowBtn = document.getElementById('gameHowBtn');
    const gameBoard = document.getElementById('gameBoard');
    const gameQuestion = document.getElementById('gameQuestion');
    const gameChoices = document.getElementById('gameChoices');
    const gameTimer = document.getElementById('gameTimer');
    const gameIndex = document.getElementById('gameIndex');
    const gameTotal = document.getElementById('gameTotal');
    const gameScoreEl = document.getElementById('gameScore');
    const gameNextBtn = document.getElementById('gameNextBtn');
    const gameResult = document.getElementById('gameResult');
    const gameResultText = document.getElementById('gameResultText');
    const gameResultDetail = document.getElementById('gameResultDetail');
    const gameRestartBtn = document.getElementById('gameRestartBtn');
    const gameCloseBtn = document.getElementById('gameCloseBtn');

    // Simple question bank
    const QUESTIONS = [
        { q: 'What emoji is commonly used for love?', choices: ['🌵','❤️','🔥','🍩'], a: 1 },
        { q: 'Which flower is most romantic?', choices: ['🌼 Daisy','🌻 Sunflower','🌹 Rose','🌸 Cherry Blossom'], a: 2 },
        { q: 'Symbol of eternal love?', choices: ['💍 Ring','🎁 Gift','🎈 Balloon','🍫 Chocolate'], a: 0 },
        { q: 'Which is a common Valentine color?', choices: ['Blue','Green','Red','Gray'], a: 2 },
        { q: 'A sweet message often ends with?', choices: ['Regards','Sincerely','Love','Thanks'], a: 2 },
        { q: 'Short affectionate nickname?', choices: ['Buddy','Honey','Boss','Mate'], a: 1 },
        // Personal-style, subjective prompts (a: -1 means no single correct answer)
        { q: 'What was the first thing you noticed about me when we met?', choices: ['Your smile','Your laugh','Your eyes','Your energy'], a: -1 },
        { q: 'If you could describe our love in one word, what would it be?', choices: ['Forever','Playful','Deep','Bright'], a: -1 },
        { q: 'What’s your favorite memory of us so far?', choices: ['Our trip','A quiet night in','A silly moment','A surprise'], a: -1 },
        { q: 'Where would you love us to spend our next Valentine’s Day together?', choices: ['Beach','Mountains','Paris','Home'], a: -1 }
    ];

    let gameState = {
        pool: [],
        index: 0,
        score: 0,
        timerId: null,
        timeLeft: 0,
        perQuestionTime: 12
    };
    const gameShowAnswerBtn = document.getElementById('gameShowAnswerBtn');

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    function openQuizModal() {
        // ensure other game modal is closed
        if (typeof preferenceModal !== 'undefined' && preferenceModal) preferenceModal.classList.remove('show');
        quizModal.classList.add('show');
        // show start screen
        gameStart.style.display = '';
        gameBoard.style.display = 'none';
        gameResult.style.display = 'none';
        animateElement(quizModal);
    }

    quizToggle.addEventListener('click', openQuizModal);
    closeQuizModal.addEventListener('click', () => quizModal.classList.remove('show'));
    quizModal.addEventListener('click', (e) => { if (e.target === quizModal) quizModal.classList.remove('show'); });

    // Start game
    gameStartBtn?.addEventListener('click', () => {
        startGame();
    });
    gameHowBtn?.addEventListener('click', () => {
        alert('Answer each question before the timer ends. Remaining seconds add to your score. Good luck!');
    });

    function startGame() {
        const pool = QUESTIONS.slice();
        shuffleArray(pool);
        gameState.pool = pool;
        gameState.index = 0;
        gameState.score = 0;
        gameTotal.textContent = pool.length;
        gameScoreEl.textContent = '0';
        gameStart.style.display = 'none';
        gameBoard.style.display = '';
        showQuestion();
    }

    function showQuestion() {
        clearInterval(gameState.timerId);
        const item = gameState.pool[gameState.index];
        gameIndex.textContent = (gameState.index + 1).toString();
        gameQuestion.textContent = item.q;
        gameChoices.innerHTML = '';
        item.choices.forEach((c, i) => {
            const b = document.createElement('button');
            b.className = 'vintage-btn';
            b.style.textAlign = 'left';
            b.textContent = c;
            b.disabled = false;
            b.addEventListener('click', () => selectAnswer(i, b));
            gameChoices.appendChild(b);
        });
        gameNextBtn.disabled = true;
        if (gameShowAnswerBtn) { gameShowAnswerBtn.style.display = 'none'; }
        // start timer
        gameState.timeLeft = gameState.perQuestionTime;
        updateTimerDisplay();
        gameState.timerId = setInterval(() => {
            gameState.timeLeft -= 1;
            updateTimerDisplay();
            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerId);
                // do NOT auto-reveal correct answer; let user choose to see it
                if (gameShowAnswerBtn) { gameShowAnswerBtn.style.display = ''; }
                gameNextBtn.disabled = false;
            }
        }, 1000);
    }

    function updateTimerDisplay() { if (gameTimer) gameTimer.textContent = String(gameState.timeLeft); }

    function selectAnswer(choiceIndex, btnEl) {
        clearInterval(gameState.timerId);
        // disable all
        Array.from(gameChoices.children).forEach(b => b.disabled = true);
        const correct = gameState.pool[gameState.index].a;
        if (correct === -1) {
            // Subjective question: award a smaller time-based bonus but accept any answer
            const points = 30 + Math.max(0, Math.round(gameState.timeLeft * 3));
            gameState.score += points;
            gameScoreEl.textContent = String(gameState.score);
            btnEl.style.outline = '3px solid #8e44ad'; // purple for subjective
        } else if (choiceIndex === correct) {
            // award points based on remaining time
            const points = 50 + Math.max(0, Math.round(gameState.timeLeft * 5));
            gameState.score += points;
            gameScoreEl.textContent = String(gameState.score);
            btnEl.style.outline = '3px solid var(--good-green)';
        } else {
            btnEl.style.outline = '3px solid rgba(200,60,60,0.9)';
            // do not auto-reveal; allow user to reveal if they want
            if (gameShowAnswerBtn) { gameShowAnswerBtn.style.display = ''; }
        }
        gameNextBtn.disabled = false;
    }

    function revealCorrect() {
        const correct = gameState.pool[gameState.index].a;
        if (correct === -1) return; // subjective question — no correct highlight
        const btn = gameChoices.children[correct];
        if (btn) btn.style.outline = '3px solid var(--good-green)';
        if (gameShowAnswerBtn) gameShowAnswerBtn.style.display = 'none';
    }

    // Show answer button handler
    gameShowAnswerBtn?.addEventListener('click', () => revealCorrect());

    gameNextBtn?.addEventListener('click', () => {
        gameState.index += 1;
        if (gameState.index >= gameState.pool.length) {
            endGame();
        } else {
            showQuestion();
        }
    });

    function endGame() {
        clearInterval(gameState.timerId);
        gameBoard.style.display = 'none';
        gameResult.style.display = '';
        const maxPossible = gameState.pool.length * (50 + gameState.perQuestionTime * 5);
        const percent = Math.round((gameState.score / maxPossible) * 100);
        gameResultText.textContent = `Your Score: ${gameState.score}`;
        gameResultDetail.textContent = `Accuracy: ${percent}% — ${getQuizMessage(percent)}`;
        if (percent >= 66) createConfetti();
    }

    gameRestartBtn?.addEventListener('click', () => startGame());
    gameCloseBtn?.addEventListener('click', () => { quizModal.classList.remove('show'); });

    // ===== LOVE TESTER =====
    const preferenceToggle = document.getElementById('preferenceToggle');
    let preferenceModal = document.getElementById('preferenceModal');
    const closePreferenceModal = document.getElementById('closePreferenceModal');
    const prefNameA = document.getElementById('prefNameA');
    const prefNameB = document.getElementById('prefNameB');
    const prefTestBtn = document.getElementById('prefTestBtn');
    const prefResultView = document.getElementById('prefResultView');
    const prefMeterFill = document.getElementById('prefMeterFill');
    const prefPercent = document.getElementById('prefPercent');
    const prefMessage = document.getElementById('prefMessage');
    const prefTryAgain = document.getElementById('prefTryAgain');
    const prefCloseBtn = document.getElementById('prefCloseBtn');

    function openPreferenceModal() {
        // defensive lookup in case element wasn't found earlier
        if (!preferenceModal) preferenceModal = document.getElementById('preferenceModal');
        if (!preferenceModal) { console.warn('preferenceModal not found'); return; }
        // close quiz modal if open
        if (typeof quizModal !== 'undefined' && quizModal) quizModal.classList.remove('show');
        console.log('openPreferenceModal called');
        try { showNotification('Opening Love Tester'); } catch {}
        preferenceModal.classList.add('show');
        // ensure visible even if CSS not applied
        try { preferenceModal.style.display = 'flex'; } catch {}
        prefResultView.style.display = 'none';
        prefNameA.value = '';
        prefNameB.value = '';
        prefMeterFill.style.width = '0%';
        prefPercent.textContent = '0';
        prefMessage.textContent = '';
        animateElement(preferenceModal);
    }

    preferenceToggle?.addEventListener('click', openPreferenceModal);
    // delegated click as a fallback if the direct binding fails
    // Use composedPath to determine whether click originated inside a modal and suppress rapid reopen after close
    let _suppressPreferenceOpenUntil = 0;
    function isEventFromModal(e) {
        if (!e) return false;
        const path = (e.composedPath && typeof e.composedPath === 'function') ? e.composedPath() : (e.path || []);
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            if (!node || !node.classList) continue;
            if (node.classList.contains && node.classList.contains('vintage-modal')) return true;
        }
        return false;
    }

    document.addEventListener('click', (e) => {
        try {

            if (isEventFromModal(e)) return;
            // if we recently closed the preference modal, suppress immediate reopen
            if (Date.now() < _suppressPreferenceOpenUntil) return;
            const t = e.target;
            if (!t) return;
            // ignore clicks on close buttons (ids that start with 'close')
            if (t.id && typeof t.id === 'string' && t.id.indexOf('close') === 0) return;
            if (t.id === 'preferenceToggle' || (t.closest && t.closest('#preferenceToggle'))) {
                try { openPreferenceModal(); } catch (err) { console.error('openPreferenceModal error', err); }
            }
        } catch (err) {
            console.error('delegated click handler error', err);
        }
    });
    closePreferenceModal?.addEventListener('click', (e) => {
        try { e.stopPropagation(); e.preventDefault(); } catch {}
        if (preferenceModal) {
            preferenceModal.classList.remove('show');
            try { preferenceModal.style.display = 'none'; } catch {}
        }
        try { prefResultView.style.display = 'none'; prefNameA.value = ''; prefNameB.value = ''; prefMeterFill.style.width = '0%'; prefPercent.textContent = '0'; prefMessage.textContent = ''; } catch {}
        _suppressPreferenceOpenUntil = Date.now() + 600;
        console.log('closePreferenceModal clicked, suppress until', _suppressPreferenceOpenUntil);
    });
    prefCloseBtn?.addEventListener('click', (e) => {
        try { e.stopPropagation(); e.preventDefault(); } catch {}
        if (preferenceModal) {
            preferenceModal.classList.remove('show');
            try { preferenceModal.style.display = 'none'; } catch {}
        }
        try { prefResultView.style.display = 'none'; prefNameA.value = ''; prefNameB.value = ''; prefMeterFill.style.width = '0%'; prefPercent.textContent = '0'; prefMessage.textContent = ''; } catch {}
        _suppressPreferenceOpenUntil = Date.now() + 600;
        console.log('prefCloseBtn clicked, suppress until', _suppressPreferenceOpenUntil);
    });
    prefTryAgain?.addEventListener('click', (e) => { try { e.stopPropagation(); e.preventDefault(); } catch {} prefResultView.style.display = 'none'; prefNameA.value = ''; prefNameB.value = ''; prefMeterFill.style.width = '0%'; prefPercent.textContent = '0'; prefMessage.textContent = ''; _suppressPreferenceOpenUntil = Date.now() + 600; });
    preferenceModal?.addEventListener('click', (e) => { if (e.target === preferenceModal) { preferenceModal.classList.remove('show'); try { preferenceModal.style.display = 'none'; } catch {} _suppressPreferenceOpenUntil = Date.now() + 600; } });

    function computeCompatibility(nameA, nameB) {
        const a = (nameA || '').toLowerCase().replace(/[^a-z]/g,'');
        const b = (nameB || '').toLowerCase().replace(/[^a-z]/g,'');
        if (!a || !b) return 0;
        // base from combined char codes
        let sum = 0;
        const combined = a + b;
        for (let i = 0; i < combined.length; i++) sum += combined.charCodeAt(i);
        let base = sum % 101;
        // bonus for shared letters
        const setA = new Set(a.split(''));
        const setB = new Set(b.split(''));
        let shared = 0;
        setA.forEach(ch => { if (setB.has(ch)) shared++; });
        base += Math.min(15, shared * 4);
        // length closeness bonus
        const lenDiff = Math.abs(a.length - b.length);
        base += Math.max(0, 6 - lenDiff);
        // clamp
        return Math.max(0, Math.min(100, Math.round(base)));
    }

    async function animateMeterTo(percent) {
        return new Promise((resolve) => {
            let cur = 0;
            const step = Math.max(1, Math.round(percent / 50));
            const iv = setInterval(() => {
                cur += step;
                if (cur >= percent) cur = percent;
                prefMeterFill.style.width = cur + '%';
                prefPercent.textContent = String(cur);
                if (cur >= percent) { clearInterval(iv); resolve(); }
            }, 20);
        });
    }

    prefTestBtn?.addEventListener('click', async () => {
        const nA = (prefNameA && prefNameA.value || '').trim();
        const nB = (prefNameB && prefNameB.value || '').trim();
        if (!nA || !nB) {
            showNotification('Please enter both names');
            return;
        }
        prefResultView.style.display = '';
        prefMeterFill.style.width = '0%';
        prefPercent.textContent = '0';
        prefMessage.textContent = 'Calculating…';
        await new Promise(r => setTimeout(r, 700));
        const percent = computeCompatibility(nA, nB);
        await animateMeterTo(percent);
        const randomChoices = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const messages = {
            perfect: [
                `A perfect spark — ${nA} and ${nB} are a cosmic match! 💖`,
                `Destined for fireworks — what a match! ✨`,
                `Two hearts in sync — pure magic. 💫`
            ],
            great: [
                `Great chemistry — lots of love energy! 💕`,
                `Sparks flying — keep the romance alive! 🌹`,
                `Sweet connection — plenty to build on. 💞`
            ],
            promising: [
                `Promising — some sweet moments ahead. 🌷`,
                `A tender start — nurture it gently. 💌`,
                `Warm feelings — could blossom into more. 🌼`
            ],
            cute: [
                `Cute pairing — fun and flirty. 🙂`,
                `A playful match — enjoy the smiles. 😄`,
                `Friendly vibes — maybe something charming grows. 🌸`
            ],
            playful: [
                `Playful pairing — maybe a fun friendship or a surprise later. 🙂`,
                `Keep it light — laughter first, love later. 😅`,
                `Unexpected chemistry sometimes needs time. 🌱`
            ]
        };

        let msg = '';
        if (percent >= 90) msg = randomChoices(messages.perfect);
        else if (percent >= 75) msg = randomChoices(messages.great);
        else if (percent >= 50) msg = randomChoices(messages.promising);
        else if (percent >= 30) msg = randomChoices(messages.cute);
        else msg = randomChoices(messages.playful);
        prefMessage.textContent = msg;
        const prefRandomMessageEl = document.getElementById('prefRandomMessage');
        if (prefRandomMessageEl) prefRandomMessageEl.textContent = msg;
        const prefHeartEl = document.getElementById('prefHeart');
        if (prefHeartEl) {
            prefHeartEl.textContent = '❤ ' + String(percent) + '%';
            prefHeartEl.style.transform = 'scale(1.06)';
            setTimeout(() => { try { prefHeartEl.style.transform = ''; } catch {} }, 300);
        }
        if (percent >= 75) createConfetti();
    });

    const coupleName = document.getElementById('coupleName');
    const coupleStory = document.getElementById('coupleStory');
    const featuredPhoto = document.querySelector('.featured-photo');
    const featuredModal = document.getElementById('featuredModal');
    const closeFeaturedModal = document.getElementById('closeFeaturedModal');
    const featuredUpload = document.getElementById('featuredUpload');
    const featuredPreview = document.getElementById('featuredPreview');
    const featuredTextEdit = document.getElementById('featuredTextEdit');
    const featuredSave = document.getElementById('featuredSave');
    const featuredCancel = document.getElementById('featuredCancel');

    // Load featured data from localStorage
    function loadFeaturedData() {
        try {
            return JSON.parse(localStorage.getItem('featuredData') || JSON.stringify({
                src: featuredPhoto.src,
                story: coupleStory.textContent
            }));
        } catch {
            return { src: featuredPhoto.src, story: coupleStory.textContent };
        }
    }

    function saveFeaturedData(data) {
        localStorage.setItem('featuredData', JSON.stringify(data));
    }

    // Apply saved featured data on load
    function applyFeaturedData() {
        const data = loadFeaturedData();
        featuredPhoto.src = data.src;
        coupleStory.textContent = data.story;
    }

    // Click photo to open edit modal
    featuredPhoto.addEventListener('click', () => {
        const data = loadFeaturedData();
        featuredPreview.src = data.src;
        featuredTextEdit.value = data.story;
        featuredModal.classList.add('show');
        animateElement(featuredModal);
    });

    // Preview image on file select
    featuredUpload.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => { featuredPreview.src = evt.target.result; };
        reader.readAsDataURL(file);
    });

    // Modal close handlers
    closeFeaturedModal.addEventListener('click', () => { featuredModal.classList.remove('show'); });
    featuredCancel.addEventListener('click', () => { featuredModal.classList.remove('show'); });
    featuredModal.addEventListener('click', (e) => {
        if (e.target === featuredModal) featuredModal.classList.remove('show');
    });

    // Save featured edits
    featuredSave.addEventListener('click', () => {
        const newSrc = featuredPreview.src;
        const newStory = featuredTextEdit.value.trim();
        if (!newSrc || !newStory) {
            showNotification('Please select an image and write a story!');
            return;
        }
        saveFeaturedData({ src: newSrc, story: newStory });
        applyFeaturedData();
        featuredModal.classList.remove('show');
        showNotification('Featured story updated!');
    });

    applyFeaturedData();

    // ===== HELPER FUNCTIONS =====

    function getQuizMessage(score) {
        if (score === 100) {
            return '🌹 Perfect! You are a true romantic! 💕';
        } else if (score >= 66) {
            return '💖 Great! Your heart is full of love!';
        } else if (score >= 33) {
            return '💝 Good start! Keep celebrating love!';
        } else {
            return '❤️ Love is what you make it every day!';
        }
    }

    function createConfetti() {
        const colors = ['#c98a8e', '#8b4513', '#c4a747', '#ffe4e1', '#5d1a1a'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.opacity = '1';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            confetti.style.borderRadius = '50%';
            document.body.appendChild(confetti);

            const duration = Math.random() * 2 + 2; // 2-4 seconds
            const xOffset = (Math.random() - 0.5) * 200;

            const animation = confetti.animate(
                [
                    { transform: 'translateY(0) translateX(0)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight}px) translateX(${xOffset}px)`, opacity: 0 }
                ],
                {
                    duration: duration * 1000,
                    easing: 'ease-in'
                }
            );

            animation.onfinish = () => confetti.remove();
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #c98a8e 0%, #8b4513 100%);
            color: #f5efe4;
            padding: 1rem 2rem;
            border-radius: 3px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: 'EB Garamond', serif;
            animation: slideUpIn 0.5s ease-out;
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.animate(
                [
                    { opacity: 1, transform: 'translateY(0)' },
                    { opacity: 0, transform: 'translateY(-20px)' }
                ],
                {
                    duration: 300,
                    easing: 'ease-out'
                }
            ).onfinish = () => notification.remove();
        }, 2000);
    }

    function animateElement(element) {
        element.animate(
            [
                { opacity: 0.5, transform: 'scale(0.95)' },
                { opacity: 1, transform: 'scale(1)' }
            ],
            {
                duration: 300,
                easing: 'ease-out'
            }
        );
    }
    function createFloatingHeart() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = '❤️';
        const size = Math.floor(Math.random() * 16) + 22; 
        const left = Math.random() * 100;
        const duration = Math.random() * 4 + 6;
        const xOffset = Math.floor((Math.random() - 0.5) * 300);

        heart.style.left = `${left}%`;
        heart.style.fontSize = `${size}px`;
        heart.style.setProperty('--xOffset', `${xOffset}px`);
        heart.style.animationDuration = `${duration}s`;

        document.body.appendChild(heart);

        setTimeout(() => heart.remove(), duration * 1000 + 200);
    }

    // Create floating hearts occasionally (every 3-5 seconds)
    setInterval(() => {
        if (Math.random() > 0.7) {
            createFloatingHeart();
        }
    }, 3000);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const allSections = document.querySelectorAll('.magazine-section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.animation = 'slideUp 0.8s ease-out both';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    allSections.forEach(section => {
        section.style.opacity = '0';
        observer.observe(section);
    });

    function applyTilt(el, e) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const tiltX = (dy / rect.height) * -6; // rotateX
        const tiltY = (dx / rect.width) * 6; // rotateY
        el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(6px)`;
    }

    allSections.forEach(section => {
        section.classList.add('tilt');
        section.addEventListener('mousemove', (e) => applyTilt(section, e));
        section.addEventListener('mouseleave', () => { section.style.transform = ''; });
    });

    const header = document.querySelector('.vintage-header');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (header) header.style.transform = `translateY(${scrolled * 0.03}px)`;
    }, { passive: true });

    const favoritesKey = 'vintageFavorites';

    // Gift database with details
    const giftDatabase = {
        'Teddy (taddy)': { icon: '🧸', desc: 'A soft and cuddly teddy bear to remind you of my warm hugs', price: '$25-50' },
        'Chocolate Box': { icon: '🍫', desc: 'Sweet chocolates to sweeten every moment we share together', price: '$15-40' },
        'Rose Bouquet': { icon: '🌹', desc: 'Beautiful red roses symbolizing eternal love and passion', price: '$30-60' },
        'Love Letter': { icon: '💌', desc: 'A handwritten love letter expressing all my feelings for you', price: 'Priceless' }
    };

    function loadFavorites() {
        try { return JSON.parse(localStorage.getItem(favoritesKey) || '[]'); } catch { return []; }
    }

    function saveFavorites(items) { localStorage.setItem(favoritesKey, JSON.stringify(items)); }

    function isFavorite(title) {
        const f = loadFavorites();
        return f.includes(title);
    }

    function toggleFavorite(title) {
        const f = loadFavorites();
        const idx = f.indexOf(title);
        if (idx > -1) {
            f.splice(idx, 1);
            saveFavorites(f);
            showNotification('Removed from saved gifts: ' + title);
        } else {
            f.push(title);
            saveFavorites(f);
            showNotification('Saved gift: ' + title);
        }
        renderGifts();
    }

    const savedToggle = document.getElementById('savedToggle');
    const savedModal = document.getElementById('savedModal');
    const closeSavedModal = document.getElementById('closeSavedModal');
    const savedClose = document.getElementById('savedClose');
    const savedList = document.getElementById('savedList');

    // Gift Details Modal
    const giftDetailsModal = document.getElementById('giftDetailsModal');
    const closeGiftDetailsModal = document.getElementById('closeGiftDetailsModal');
    const closeGiftDetailsBtn = document.getElementById('closeGiftDetailsBtn');
    const giftDetailsTitle = document.getElementById('giftDetailsTitle');
    const giftDetailsIcon = document.getElementById('giftDetailsIcon');
    const giftDetailsName = document.getElementById('giftDetailsName');
    const giftDetailsDesc = document.getElementById('giftDetailsDesc');

    savedToggle.addEventListener('click', () => {
        displaySavedGifts();
        savedModal.classList.add('show');
        animateElement(savedModal);
    });

    closeSavedModal.addEventListener('click', () => {
        savedModal.classList.remove('show');
    });

    savedClose.addEventListener('click', () => {
        savedModal.classList.remove('show');
    });

    savedModal.addEventListener('click', (e) => {
        if (e.target === savedModal) {
            savedModal.classList.remove('show');
        }
    });
    closeGiftDetailsModal.addEventListener('click', () => {
        giftDetailsModal.classList.remove('show');
    });

    closeGiftDetailsBtn.addEventListener('click', () => {
        giftDetailsModal.classList.remove('show');
    });

    giftDetailsModal.addEventListener('click', (e) => {
        if (e.target === giftDetailsModal) {
            giftDetailsModal.classList.remove('show');
        }
    });
    function showGiftDetails(giftTitle) {
        const gift = giftDatabase[giftTitle];
        if (!gift) return;

        giftDetailsTitle.textContent = giftTitle;
        giftDetailsIcon.textContent = gift.icon;
        giftDetailsName.textContent = giftTitle;
        giftDetailsDesc.textContent = gift.desc;

        giftDetailsModal.classList.add('show');
        animateElement(giftDetailsModal);
    }

    function displaySavedGifts() {
        const favorites = loadFavorites();
        savedList.innerHTML = '';

        if (!favorites.length) {
            savedList.innerHTML = '<p class="vintage-text-center" style="padding:2rem;color:var(--charcoal);">No saved gifts yet. Click the heart on any gift to save it! 💕</p>';
            return;
        }

        favorites.forEach(title => {
            const gift = giftDatabase[title] || { icon: '❤️', desc: 'Special gift' };
            const card = document.createElement('div');
            card.className = 'gift-card';
            card.innerHTML = `
                <div style="font-size:2.5rem; margin-bottom:0.5rem;">${gift.icon}</div>
                <h4 class="gift-title">${title}</h4>
                <p class="gift-description">${gift.desc}</p>
                <button class="vintage-btn good-design-btn view-gift-btn" data-gift="${title}" style="margin-top:1rem;">View</button>
            `;
            savedList.appendChild(card);
        });

        // Add event listeners to View buttons
        document.querySelectorAll('.view-gift-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const giftTitle = e.target.getAttribute('data-gift');
                showGiftDetails(giftTitle);
            });
        });
    }

    function loadGifts() {
        try { return JSON.parse(localStorage.getItem('vintageGifts') || '[]'); } catch { return []; }
    }

    function saveGifts(items) { localStorage.setItem('vintageGifts', JSON.stringify(items)); }

    function renderGifts() {
        const iconFor = (title) => {
            const t = title.toLowerCase();
            if (t.includes('teddy') || t.includes('taddy') || t.includes('bear')) return '🧸';
            if (t.includes('choc') || t.includes('chocolate')) return '🍫';
            if (t.includes('rose') || t.includes('bouquet')) return '🌹';
            if (t.includes('card') || t.includes('postcard') || t.includes('love')) return '💌';
            if (t.includes('perfume')) return '🌸';
            return '❤';
        };

        const grid = document.getElementById('giftsGrid');
        const items = loadGifts();
        grid.innerHTML = '';
        if (!items.length) {
            grid.innerHTML = '<p class="vintage-text-center">No gifts yet. Tell me which personal gifts to show and I\'ll add them for you.</p>';
            return;
        }
        items.forEach((it, idx) => {
            const card = document.createElement('div');
            card.className = 'gift-card';
            const hasImage = it.image && it.image !== 'undefined';
            const icon = hasImage ? `<img src="${it.image}" alt="${escapeHtml(it.title || '')}" style="max-width:100%;max-height:100%;object-fit:cover;">` : `<div style="font-size:3rem;line-height:1;">${iconFor(it.title || '')}</div>`;
            card.innerHTML = `
                <div class="gift-image" style="height:140px;display:flex;align-items:center;justify-content:center;background:#fff;">
                    ${icon}
                </div>
                <h4 class="gift-title">${escapeHtml(it.title || '')}</h4>
                <p class="gift-description">A thoughtful gift idea.</p>
            `;

            const fav = isFavorite(it.title);
            const favBadge = document.createElement('div');
            favBadge.className = 'gift-fav';
            favBadge.innerHTML = fav ? '❤️' : '🤍';
            favBadge.title = fav ? 'Saved' : 'Save this gift';
            favBadge.style.cursor = 'pointer';
            favBadge.addEventListener('click', (e) => { e.stopPropagation(); toggleFavorite(it.title); });
            card.appendChild(favBadge);

            grid.appendChild(card);
        });
    }

    function ensureDefaultGifts() {
        const existing = loadGifts();
        if (existing.length) return;
        const defaults = [
            { title: 'Teddy (taddy)',  image: '' },
            { title: 'Chocolate Box',  image: '' },
            { title: 'Rose Bouquet',  image: '' },
            { title: 'Love Letter',  image: '' }
        ];
        saveGifts(defaults);
    }
    ensureDefaultGifts();
    renderGifts();

    const giftTitleInput = document.getElementById('giftTitleInput');
    const giftImageInput = document.getElementById('giftImageInput');
    const addGiftFormBtn = document.getElementById('addGiftFormBtn');

    addGiftFormBtn?.addEventListener('click', () => {
        const title = giftTitleInput?.value.trim();
        const file = giftImageInput && giftImageInput.files && giftImageInput.files[0];
        if (!title) return showNotification('Please enter a gift title');

        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                const dataUrl = evt.target.result;
                const items = loadGifts();
                items.unshift({ title: title, image: dataUrl });
                saveGifts(items);
                renderGifts();
                if (giftTitleInput) giftTitleInput.value = '';
                if (giftImageInput) giftImageInput.value = '';
                showNotification('Gift added');
            };
            reader.readAsDataURL(file);
        } else {
            const items = loadGifts();
            items.unshift({ title: title, image: '' });
            saveGifts(items);
            renderGifts();
            if (giftTitleInput) giftTitleInput.value = '';
            showNotification('Gift added');
        }
    });

    const downloadBtn = document.getElementById('downloadLetter');
    const letterCard = document.querySelector('.letter-card');
    downloadBtn?.addEventListener('click', async () => {
        if (!letterCard || !window.html2canvas) {
            showNotification('Download not supported', 'error');
            return;
        }
        
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = '⏳ Creating...';
        downloadBtn.disabled = true;
        
        try {
            const cloneCard = letterCard.cloneNode(true);

            cloneCard.style.position = 'absolute';
            cloneCard.style.left = '-9999px';
            cloneCard.style.top = '-9999px';
            cloneCard.style.width = '600px';
            cloneCard.style.backgroundColor = '#fff5f4';
            cloneCard.style.padding = '2.5rem';
            cloneCard.style.border = '3px solid #e74c3c';
            cloneCard.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            
            document.body.appendChild(cloneCard);

            const canvas = await html2canvas(cloneCard, { 
                scale: 2,
                backgroundColor: '#f5efe4',
                logging: false,
                useCORS: true,
                allowTaint: true
            });

            document.body.removeChild(cloneCard);
            const link = document.createElement('a');
            const timestamp = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
            link.download = `Valentine_Postcard_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            showNotification('💌 Postcard downloaded successfully!');
        } catch (err) {
            console.error('Download error:', err);
            showNotification('Unable to download postcard', 'error');
        } finally {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    });

    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const yesResponse = document.getElementById('yesResponse');
    const noResponse = document.getElementById('noResponse');
    const backHomeBtn = document.getElementById('backHomeBtn');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const proposalButtons = document.querySelector('.proposal-buttons');
    
    let noClicks = 0;

    yesBtn.addEventListener('click', () => {
        try { proposalButtons.style.display = 'none'; } catch {}
        try { yesResponse.classList.add('show'); yesResponse.style.display = 'block'; } catch {}
        createConfetti();
        animateElement(yesResponse);
    });

    noBtn.addEventListener('click', () => {
        noClicks++;
        
        const randomX = Math.random() * 200 - 100;
        const randomY = Math.random() * 200 - 100;
        
        noBtn.style.position = 'relative';
        noBtn.style.transform = `translate(${randomX}px, ${randomY}px)`;
        noBtn.style.animation = 'shake 0.5s ease-in-out';
        
        if (noClicks >= 3) {
            try { proposalButtons.style.display = 'none'; } catch {}
            try { noResponse.classList.add('show'); noResponse.style.display = 'block'; } catch {}
            animateElement(noResponse);
        }
    });

    tryAgainBtn.addEventListener('click', () => {
        noClicks = 0;
        try { noBtn.style.transform = 'translate(0, 0)'; noBtn.style.animation = 'none'; } catch {}
        try { proposalButtons.style.display = 'flex'; } catch {}
        try { noResponse.classList.remove('show'); noResponse.style.display = 'none'; } catch {}
        animateElement(proposalButtons);
    });

    const closeNoResponse = document.getElementById('closeNoResponse');
    const closeNoResponseBtn = document.getElementById('closeNoResponseBtn');
    closeNoResponse?.addEventListener('click', (e) => {
        try { e.stopPropagation(); e.preventDefault(); } catch {}
        try { noResponse.classList.remove('show'); noResponse.style.display = 'none'; } catch {}
        try { proposalButtons.style.display = 'flex'; } catch {}
    });
    closeNoResponseBtn?.addEventListener('click', (e) => {
        try { e.stopPropagation(); e.preventDefault(); } catch {}
        try { noResponse.classList.remove('show'); noResponse.style.display = 'none'; } catch {}
        try { proposalButtons.style.display = 'flex'; } catch {}
    });
    noResponse?.addEventListener('click', (e) => {
        if (e.target === noResponse) {
            try { noResponse.classList.remove('show'); noResponse.style.display = 'none'; } catch {}
            try { proposalButtons.style.display = 'flex'; } catch {}
        }
    });

    if (backHomeBtn) {
        backHomeBtn.addEventListener('click', () => {
            if (yesResponse) { yesResponse.classList.remove('show'); try { yesResponse.style.display = 'none'; } catch {} }
            if (proposalButtons) proposalButtons.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification('Welcome back!');
            animateElement(proposalButtons);
        });
    }

    const closeYesResponse = document.getElementById('closeYesResponse');
    closeYesResponse?.addEventListener('click', (e) => {
        try { e.stopPropagation(); e.preventDefault(); } catch {}
        if (yesResponse) { yesResponse.classList.remove('show'); try { yesResponse.style.display = 'none'; } catch {} }
        if (proposalButtons) proposalButtons.style.display = 'flex';
    });
    yesResponse?.addEventListener('click', (e) => {
        if (e.target === yesResponse) {
            yesResponse.classList.remove('show'); try { yesResponse.style.display = 'none'; } catch {};
            if (proposalButtons) proposalButtons.style.display = 'flex';
        }
    });

    function createConfetti() {
        const canvas = document.getElementById('heartsCanvas');
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const ctx = canvas.getContext('2d');
        const colors = ['#c98a8e', '#c4a747', '#5d1a1a', '#fff', '#ffe4e1'];
        const confetti = [];

        for (let i = 0; i < 50; i++) {
            confetti.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 6 + 2,
                speedX: Math.random() * 4 - 2,
                speedY: Math.random() * 8 + 4,
                angle: Math.random() * Math.PI * 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function animateConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < confetti.length; i++) {
                const p = confetti[i];
                p.x += p.speedX;
                p.y += p.speedY;
                p.angle += 0.1;
                
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }

            if (confetti.some(p => p.y < canvas.height)) {
                requestAnimationFrame(animateConfetti);
            }
        }

        animateConfetti();
    }

    // ===== STYLE CARDS INLINE EDITOR =====
    (function initStyleCardEditors(){
        const stored = (() => { try { return JSON.parse(localStorage.getItem('styleCards') || '{}'); } catch { return {}; } })();
        // Save initial defaults if not already saved
        (function saveDefaults(){
            try {
                if (!localStorage.getItem('styleCardsDefaults')) {
                    const defaults = {};
                    document.querySelectorAll('.styles-grid .style-card').forEach((c,i) => {
                        const img = c.querySelector('img');
                        const t = c.querySelector('.style-title')?.textContent || '';
                        const d = c.querySelector('.style-desc')?.textContent || '';
                        defaults[i] = { src: img?.src || '', title: t, desc: d };
                    });
                    localStorage.setItem('styleCardsDefaults', JSON.stringify(defaults));
                }
            } catch {}
        })();
        const cards = document.querySelectorAll('.styles-grid .style-card');
        if (!cards || !cards.length) return;

        cards.forEach((card, idx) => {
            card.dataset.idx = idx;
            const img = card.querySelector('img');
            const titleEl = card.querySelector('.style-title');
            const descEl = card.querySelector('.style-desc');

            if (stored[idx]) {
                if (stored[idx].src) img.src = stored[idx].src;
                if (stored[idx].title) titleEl.textContent = stored[idx].title;
                if (stored[idx].desc) descEl.textContent = stored[idx].desc;
            }

            img.addEventListener('click', (e) => {
                e.stopPropagation();
                openCardEditor(card, idx, img, titleEl, descEl);
            });

            card.addEventListener('click', (e) => {
                if (card.querySelector('.card-editor')) return;
                openCardEditor(card, idx, img, titleEl, descEl);
            });
        });

        function openCardEditor(card, idx, imgEl, titleEl, descEl) {
            const styleModal = document.getElementById('styleEditModal');
            const styleUpload = document.getElementById('styleUpload');
            const stylePreview = document.getElementById('stylePreview');
            const styleTitleEdit = document.getElementById('styleTitleEdit');
            const styleDescEdit = document.getElementById('styleDescEdit');
            const styleSave = document.getElementById('styleSave');
            const styleCancel = document.getElementById('styleCancel');
            const closeStyleModal = document.getElementById('closeStyleModal');

            if (!styleModal) return;

            stylePreview.src = imgEl.src || '';
            styleTitleEdit.value = titleEl.textContent.trim();
            styleDescEdit.value = descEl.textContent.trim();

            styleModal.classList.add('show');
            try { if (styleUpload) styleUpload.value = ''; } catch (err) {}
            // focus title input so user can write immediately
            try { if (styleTitleEdit) styleTitleEdit.focus(); } catch (err) {}
            animateElement(styleModal);

            const onFileChange = (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f) return;
                if (!f.type.startsWith('image/')) { showNotification('Please select an image'); return; }
                const r = new FileReader();
                r.onload = (ev) => { stylePreview.src = ev.target.result; };
                r.readAsDataURL(f);
            };

            styleUpload.addEventListener('change', onFileChange);

            // allow clicking preview to open file chooser
            let previewClickHandler = null;
            if (stylePreview) {
                stylePreview.style.cursor = 'pointer';
                previewClickHandler = () => styleUpload.click();
                stylePreview.addEventListener('click', previewClickHandler);
            }

            const styleChangeBtn = document.getElementById('styleChangeBtn');
            let changeBtnHandler = null;
            if (styleChangeBtn) {
                changeBtnHandler = () => styleUpload.click();
                styleChangeBtn.addEventListener('click', changeBtnHandler);
            }

            const saveHandler = () => {
                const newSrc = stylePreview.src;
                const newTitle = styleTitleEdit.value.trim() || titleEl.textContent;
                const newDesc = styleDescEdit.value.trim() || descEl.textContent;
                if (newSrc) imgEl.src = newSrc;
                titleEl.textContent = newTitle;
                descEl.textContent = newDesc;
                stored[idx] = { src: newSrc, title: newTitle, desc: newDesc };
                try { localStorage.setItem('styleCards', JSON.stringify(stored)); } catch {}
                showNotification('Saved');
                card.classList.add('save-pulse');
                setTimeout(() => card.classList.remove('save-pulse'), 750);
                cleanupAndClose();
            };

                // keyboard helpers: Enter in title -> focus desc; Ctrl/Cmd+Enter in desc -> save
                let titleKeyHandler = null;
                let descKeyHandler = null;
                if (styleTitleEdit) {
                    titleKeyHandler = (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            styleDescEdit.focus();
                        }
                    };
                    styleTitleEdit.addEventListener('keydown', titleKeyHandler);
                }
                if (styleDescEdit) {
                    descKeyHandler = (e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            saveHandler();
                        }
                    };
                    styleDescEdit.addEventListener('keydown', descKeyHandler);
                }

            const cleanupAndClose = () => {
                styleUpload.removeEventListener('change', onFileChange);
                styleSave.removeEventListener('click', saveHandler);
                styleCancel.removeEventListener('click', cleanupAndClose);
                closeStyleModal.removeEventListener('click', cleanupAndClose);
                if (previewClickHandler && stylePreview) stylePreview.removeEventListener('click', previewClickHandler);
                if (changeBtnHandler && styleChangeBtn) styleChangeBtn.removeEventListener('click', changeBtnHandler);
                    if (titleKeyHandler && styleTitleEdit) styleTitleEdit.removeEventListener('keydown', titleKeyHandler);
                    if (descKeyHandler && styleDescEdit) styleDescEdit.removeEventListener('keydown', descKeyHandler);
                styleModal.classList.remove('show');
            };

            styleSave.addEventListener('click', saveHandler);
            styleCancel.addEventListener('click', cleanupAndClose);
            closeStyleModal.addEventListener('click', cleanupAndClose);

            // Do not auto-open file picker; user can click preview or 'Change Photo'
        }
    })();

    // ==KEYBOARD SHORTCUTS==
    document.addEventListener('keydown', (e) => {
        // Press 'm' to toggle music
        if (e.key === 'm' || e.key === 'M') {
            audioToggle.click();
        }
        // Press 'q' to open 
        if (e.key === 'q' || e.key === 'Q') {
            quizToggle.click();
        }
        if (e.key === 'Escape') {
            messageModal.classList.remove('show');
            quizModal.classList.remove('show');
        }
    });
    console.log('Keyboard shortcuts: M = Music, Q = Quiz, ESC = Close Modals');
});
