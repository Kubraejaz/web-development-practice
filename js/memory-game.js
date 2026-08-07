/**
 * Nimbus Memory Card Game - Core App Interactivity
 * Feature Set: 3D card flips, difficulty levels, move/time tracking,
 *               best-score persistence via localStorage, win celebration
 */

(function () {
    'use strict';

    const THEME_KEY = 'nimbus_memory_theme';
    const BEST_KEY = 'nimbus_memory_best';

    const DIFFICULTIES = {
        easy:   { rows: 4, cols: 4, gridClass: 'mg-grid--easy' },
        medium: { rows: 4, cols: 5, gridClass: 'mg-grid--medium' },
        hard:   { rows: 4, cols: 6, gridClass: 'mg-grid--hard' }
    };

    const FACES = [
        '🚀', '🌟', '🎧', '⚡', '💎', '🎲',
        '🎯', '🔮', '🦊', '🍕', '🚲', '🎪'
    ];

    let activeDiff = 'easy';
    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let moves = 0;
    let pairsFound = 0;
    let totalPairs = 0;
    let timerInterval = null;
    let startTime = null;
    let elapsed = 0;
    let gameStarted = false;

    const grid = document.getElementById('cardGrid');
    const toast = document.getElementById('toast');
    const winOverlay = document.getElementById('winOverlay');

    const statPairs = document.getElementById('statPairs');
    const statMoves = document.getElementById('statMoves');
    const statTime = document.getElementById('statTime');
    const statBest = document.getElementById('statBest');

    // ==========================================================================
    // HELPERS
    // ==========================================================================

    function getBest(diff) {
        const data = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
        return data[diff] != null ? data[diff] : null;
    }

    function saveBest(diff, value) {
        const data = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
        if (data[diff] == null || value < data[diff]) {
            data[diff] = value;
            localStorage.setItem(BEST_KEY, JSON.stringify(data));
            return true;
        }
        return false;
    }

    function formatTime(secs) {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return m + ':' + String(s).padStart(2, '0');
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2400);
    }

    // ==========================================================================
    // GAME SETUP
    // ==========================================================================

    function buildDeck() {
        const config = DIFFICULTIES[activeDiff];
        totalPairs = (config.rows * config.cols) / 2;
        const deck = [];
        for (let i = 0; i < totalPairs; i++) {
            deck.push(FACES[i % FACES.length]);
            deck.push(FACES[i % FACES.length]);
        }
        return deck.sort(() => Math.random() - 0.5);
    }

    function renderGrid() {
        const config = DIFFICULTIES[activeDiff];
        grid.className = 'mg-grid ' + config.gridClass;
        grid.innerHTML = '';

        cards = buildDeck().map((face, index) => ({
            id: index,
            face: face,
            matched: false
        }));

        cards.forEach(card => {
            const el = document.createElement('div');
            el.className = 'mg-card';
            el.dataset.index = card.id;

            el.innerHTML =
                '<div class="mg-card__inner">' +
                    '<div class="mg-card__face mg-card__face--back"></div>' +
                    '<div class="mg-card__face mg-card__face--front">' + card.face + '</div>' +
                '</div>';

            el.addEventListener('click', () => flipCard(card.id, el));
            grid.appendChild(el);
        });
    }

    // ==========================================================================
    // TIMER
    // ==========================================================================

    function startTimer() {
        startTime = Date.now() - elapsed * 1000;
        timerInterval = setInterval(() => {
            elapsed = Math.floor((Date.now() - startTime) / 1000);
            statTime.textContent = formatTime(elapsed);
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // ==========================================================================
    // CARD FLIP LOGIC
    // ==========================================================================

    function flipCard(index, el) {
        if (lockBoard || gameStarted === false) return;
        if (el.classList.contains('is-flipped') || el.classList.contains('is-matched')) return;
        if (secondCard) return;

        el.classList.add('is-flipped');

        if (!firstCard) {
            firstCard = { index: index, el: el };
            return;
        }

        secondCard = { index: index, el: el };
        moves++;
        statMoves.textContent = moves;

        const cardA = cards[firstCard.index];
        const cardB = cards[secondCard.index];

        if (cardA.face === cardB.face) {
            handleMatch();
        } else {
            handleMismatch();
        }
    }

    function handleMatch() {
        firstCard.el.classList.add('is-matched');
        secondCard.el.classList.add('is-matched');
        cards[firstCard.index].matched = true;
        cards[secondCard.index].matched = true;

        pairsFound++;
        statPairs.textContent = pairsFound;

        firstCard = null;
        secondCard = null;

        if (pairsFound === totalPairs) {
            setTimeout(handleWin, 450);
        }
    }

    function handleMismatch() {
        lockBoard = true;
        firstCard.el.classList.add('is-wrong');
        secondCard.el.classList.add('is-wrong');

        const cardA = firstCard;
        const cardB = secondCard;

        setTimeout(() => {
            cardA.el.classList.remove('is-flipped', 'is-wrong');
            cardB.el.classList.remove('is-flipped', 'is-wrong');
            firstCard = null;
            secondCard = null;
            lockBoard = false;
        }, 800);
    }

    // ==========================================================================
    // WIN FLOW
    // ==========================================================================

    function handleWin() {
        stopTimer();
        const isNewBest = saveBest(activeDiff, moves);

        document.getElementById('winMoves').textContent = moves;
        document.getElementById('winTime').textContent = formatTime(elapsed);
        document.getElementById('winPairs').textContent = pairsFound;
        document.getElementById('newBestBadge').style.display = isNewBest ? 'inline-block' : 'none';

        updateBestDisplay();
        winOverlay.classList.add('is-visible');
        winOverlay.setAttribute('aria-hidden', 'false');
        gameStarted = false;
    }

    // ==========================================================================
    // STATE / UI UPDATES
    // ==========================================================================

    function updateBestDisplay() {
        const best = getBest(activeDiff);
        statBest.textContent = best != null ? best : '—';
    }

    function resetScoreboard() {
        moves = 0;
        pairsFound = 0;
        elapsed = 0;
        gameStarted = false;
        firstCard = null;
        secondCard = null;
        lockBoard = false;
        stopTimer();

        statMoves.textContent = '0';
        statPairs.textContent = '0';
        statTime.textContent = '0:00';
    }

    function startNewGame() {
        resetScoreboard();
        renderGrid();
        updateBestDisplay();
        winOverlay.classList.remove('is-visible');
        winOverlay.setAttribute('aria-hidden', 'true');
        showToast('New game · ' + activeDiff.charAt(0).toUpperCase() + activeDiff.slice(1));
        gameStarted = true;
        startTimer();
    }

    // ==========================================================================
    // THEME
    // ==========================================================================

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || 'theme-dark';
        document.body.className = saved;
    }

    function toggleTheme() {
        if (document.body.classList.contains('theme-dark')) {
            document.body.className = 'theme-light';
            localStorage.setItem(THEME_KEY, 'theme-light');
            showToast('Switched to Light Mode');
        } else {
            document.body.className = 'theme-dark';
            localStorage.setItem(THEME_KEY, 'theme-dark');
            showToast('Switched to Dark Mode');
        }
    }

    // ==========================================================================
    // EVENT WIRING
    // ==========================================================================

    document.querySelectorAll('.mg-diff-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            if (this.dataset.diff === activeDiff) return;
            activeDiff = this.dataset.diff;
            document.querySelectorAll('.mg-diff-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            startNewGame();
        });
    });

    document.getElementById('btnNewGame').addEventListener('click', startNewGame);

    document.getElementById('btnPlayAgain').addEventListener('click', startNewGame);

    document.getElementById('btnResetBest').addEventListener('click', function () {
        const data = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
        delete data[activeDiff];
        localStorage.setItem(BEST_KEY, JSON.stringify(data));
        updateBestDisplay();
        showToast('Best score reset');
    });

    document.getElementById('btnToggleTheme').addEventListener('click', toggleTheme);

    // ==========================================================================
    // INIT
    // ==========================================================================

    initTheme();
    updateBestDisplay();
    startNewGame();
})();
