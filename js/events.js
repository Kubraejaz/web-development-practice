// ==========================================
// JavaScript DOM Events Lab & Visual Logger
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const loggerFeed = document.getElementById('loggerFeed');
    const clearLogsBtn = document.getElementById('clearLogsBtn');

    // Helper: Log event to visual feed
    function logEvent(category, eventName, details) {
        if (!loggerFeed) return;

        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${category}`;
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <div class="log-event">[${category.toUpperCase()}] ${eventName}</div>
            <div class="log-details">${details}</div>
        `;

        loggerFeed.prepend(entry);

        // Keep last 40 logs max
        if (loggerFeed.children.length > 40) {
            loggerFeed.removeChild(loggerFeed.lastChild);
        }
    }

    // Helper: Pulse visual demo container
    function triggerPulse(elementId, textOutput) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        el.classList.add('active-pulse');
        setTimeout(() => el.classList.remove('active-pulse'), 300);

        if (textOutput) {
            const badge = el.querySelector('.output-badge');
            if (badge) badge.textContent = textOutput;
        }
    }

    // Clear logs button
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', () => {
            loggerFeed.innerHTML = '<div style="color:#64748b; text-align:center; padding:20px;">Logs cleared. Trigger any event to see live data.</div>';
        });
    }

    // ==========================================
    // 1. MOUSE EVENTS
    // ==========================================
    
    // click
    const btnClick = document.getElementById('demoClickBtn');
    if (btnClick) {
        btnClick.addEventListener('click', (e) => {
            triggerPulse('demoClickBox', 'Clicked!');
            logEvent('mouse', 'click', `x: ${e.clientX}, y: ${e.clientY} | button: ${e.button}`);
        });
    }

    // dblclick
    const btnDblClick = document.getElementById('demoDblClickBtn');
    if (btnDblClick) {
        btnDblClick.addEventListener('dblclick', (e) => {
            triggerPulse('demoDblClickBox', 'Double Clicked! ✨');
            logEvent('mouse', 'dblclick', `Double click target: <${e.target.tagName.toLowerCase()}>`);
        });
    }

    // mousedown & mouseup
    const btnMouseDownUp = document.getElementById('demoMouseDownUpBtn');
    if (btnMouseDownUp) {
        btnMouseDownUp.addEventListener('mousedown', (e) => {
            triggerPulse('demoMouseDownUpBox', 'Mouse Down ⬇️');
            logEvent('mouse', 'mousedown', `Button pressed: ${e.button === 0 ? 'Primary Left' : 'Secondary/Right'}`);
        });
        btnMouseDownUp.addEventListener('mouseup', (e) => {
            triggerPulse('demoMouseDownUpBox', 'Mouse Up ⬆️');
            logEvent('mouse', 'mouseup', 'Mouse button released');
        });
    }

    // mouseenter & mouseleave
    const areaHover = document.getElementById('demoHoverArea');
    if (areaHover) {
        areaHover.addEventListener('mouseenter', () => {
            triggerPulse('demoHoverArea', 'Mouse Entered 🚪');
            logEvent('mouse', 'mouseenter', 'Cursor entered element boundary');
        });
        areaHover.addEventListener('mouseleave', () => {
            triggerPulse('demoHoverArea', 'Mouse Left 🏃');
            logEvent('mouse', 'mouseleave', 'Cursor left element boundary');
        });
    }

    // mouseover & mouseout
    const areaOverOut = document.getElementById('demoOverOutArea');
    if (areaOverOut) {
        areaOverOut.addEventListener('mouseover', (e) => {
            triggerPulse('demoOverOutArea', `Over: <${e.target.tagName.toLowerCase()}>`);
            logEvent('mouse', 'mouseover', `Mouse over target: ${e.target.tagName}`);
        });
        areaOverOut.addEventListener('mouseout', (e) => {
            triggerPulse('demoOverOutArea', 'Mouse Out');
            logEvent('mouse', 'mouseout', 'Mouse moved out of target');
        });
    }

    // mousemove
    const areaMove = document.getElementById('demoMouseMoveArea');
    if (areaMove) {
        areaMove.addEventListener('mousemove', (e) => {
            const rect = areaMove.getBoundingClientRect();
            const relX = Math.round(e.clientX - rect.left);
            const relY = Math.round(e.clientY - rect.top);
            triggerPulse('demoMouseMoveArea', `X: ${relX}px, Y: ${relY}px`);
            logEvent('mouse', 'mousemove', `Local X: ${relX}, Local Y: ${relY}`);
        });
    }

    // contextmenu (Right click)
    const areaContext = document.getElementById('demoContextMenuArea');
    if (areaContext) {
        areaContext.addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Prevent default browser right-click menu
            triggerPulse('demoContextMenuArea', 'Custom Right-Click Intercepted! 🛡️');
            logEvent('mouse', 'contextmenu', 'Right-click menu default prevented');
        });
    }

    // ==========================================
    // 2. KEYBOARD EVENTS
    // ==========================================
    const inputKeydown = document.getElementById('demoKeydownInput');
    if (inputKeydown) {
        inputKeydown.addEventListener('keydown', (e) => {
            triggerPulse('demoKeydownBox', `Key: "${e.key}" (Code: ${e.code})`);
            logEvent('keyboard', 'keydown', `Key: "${e.key}" | Code: ${e.code} | Shift: ${e.shiftKey}`);
        });
        inputKeydown.addEventListener('keyup', (e) => {
            triggerPulse('demoKeydownBox', `Released: "${e.key}"`);
            logEvent('keyboard', 'keyup', `Released key "${e.key}"`);
        });
    }

    // ==========================================
    // 3. FORM & INPUT EVENTS
    // ==========================================

    // input (Live typing)
    const inputLive = document.getElementById('demoInputLive');
    if (inputLive) {
        inputLive.addEventListener('input', (e) => {
            triggerPulse('demoInputBox', `Live Value: "${e.target.value}"`);
            logEvent('form', 'input', `Current value length: ${e.target.value.length}`);
        });
    }

    // change (Committed value)
    const selectChange = document.getElementById('demoSelectChange');
    if (selectChange) {
        selectChange.addEventListener('change', (e) => {
            triggerPulse('demoChangeBox', `Selected: ${e.target.value}`);
            logEvent('form', 'change', `New value selected: "${e.target.value}"`);
        });
    }

    // focus & blur
    const inputFocusBlur = document.getElementById('demoFocusBlurInput');
    if (inputFocusBlur) {
        inputFocusBlur.addEventListener('focus', () => {
            triggerPulse('demoFocusBlurBox', 'Input Focused 💡');
            logEvent('form', 'focus', 'Element gained focus');
        });
        inputFocusBlur.addEventListener('blur', () => {
            triggerPulse('demoFocusBlurBox', 'Input Blurred 💤');
            logEvent('form', 'blur', 'Element lost focus');
        });
    }

    // submit & reset
    const formDemo = document.getElementById('demoForm');
    if (formDemo) {
        formDemo.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page refresh
            triggerPulse('demoFormBox', 'Form Submitted! (Prevented default page reload) 🚀');
            logEvent('form', 'submit', 'Form submit event intercepted with preventDefault()');
        });
        formDemo.addEventListener('reset', () => {
            triggerPulse('demoFormBox', 'Form Cleared/Reset 🧹');
            logEvent('form', 'reset', 'Form reset triggered');
        });
    }

    // select (Text selected inside input)
    const inputSelectText = document.getElementById('demoSelectTextInput');
    if (inputSelectText) {
        inputSelectText.addEventListener('select', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const selectedStr = e.target.value.substring(start, end);
            triggerPulse('demoSelectTextBox', `Selected string: "${selectedStr}"`);
            logEvent('form', 'select', `Text range [${start}:${end}] -> "${selectedStr}"`);
        });
    }

    // ==========================================
    // 4. CLIPBOARD & SELECTION EVENTS
    // ==========================================
    const inputClipboard = document.getElementById('demoClipboardInput');
    if (inputClipboard) {
        inputClipboard.addEventListener('copy', () => {
            triggerPulse('demoClipboardBox', 'Copied to Clipboard! 📋');
            logEvent('clipboard', 'copy', 'Text copied from element');
        });
        inputClipboard.addEventListener('cut', () => {
            triggerPulse('demoClipboardBox', 'Cut to Clipboard! ✂️');
            logEvent('clipboard', 'cut', 'Text cut from element');
        });
        inputClipboard.addEventListener('paste', (e) => {
            const pastedText = (e.clipboardData || window.clipboardData).getData('text');
            triggerPulse('demoClipboardBox', `Pasted: "${pastedText}"`);
            logEvent('clipboard', 'paste', `Pasted content length: ${pastedText.length} chars`);
        });
    }

    // ==========================================
    // 5. DRAG & DROP EVENTS
    // ==========================================
    const dragItem = document.getElementById('demoDragItem');
    const dropZone = document.getElementById('demoDropZone');

    if (dragItem && dropZone) {
        dragItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', 'Nimbus Event Object');
            triggerPulse('demoDragBox', 'Dragging Started 📦');
            logEvent('drag', 'dragstart', 'Drag payload initialized');
        });

        dragItem.addEventListener('dragend', () => {
            logEvent('drag', 'dragend', 'Drag operation finished');
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping!
            dropZone.classList.add('hovered');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('hovered');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('hovered');
            const data = e.dataTransfer.getData('text/plain');
            triggerPulse('demoDragBox', `Dropped successfully: "${data}" 🎉`);
            logEvent('drag', 'drop', `Received data: "${data}"`);
        });
    }

    // ==========================================
    // 6. WINDOW & PAGE EVENTS
    // ==========================================
    logEvent('window', 'DOMContentLoaded', 'DOM tree successfully loaded and parsed!');

    // Window Resize
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const display = document.getElementById('windowSizeDisplay');
        if (display) display.textContent = `${w}px × ${h}px`;
        logEvent('window', 'resize', `Viewport dimensions: ${w}x${h}`);
    });

    // Custom Scroll Area
    const scrollBox = document.getElementById('demoScrollBox');
    if (scrollBox) {
        scrollBox.addEventListener('scroll', () => {
            const scrollTop = Math.round(scrollBox.scrollTop);
            triggerPulse('demoScrollContainer', `Scroll Top: ${scrollTop}px`);
            logEvent('window', 'scroll', `Element scrolled to ${scrollTop}px`);
        });
    }

    // Image Load Event
    const demoImage = document.getElementById('demoImageTarget');
    if (demoImage) {
        if (demoImage.complete) {
            triggerPulse('demoImageBox', 'Image Loaded Successfully! 🖼️');
            logEvent('window', 'load', 'Image resource loaded (cached)');
        } else {
            demoImage.addEventListener('load', () => {
                triggerPulse('demoImageBox', 'Image Loaded Successfully! 🖼️');
                logEvent('window', 'load', 'Image resource finish loading event');
            });
        }
    }

    // ==========================================
    // 7. CATEGORY TAB FILTERING
    // ==========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.event-section');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            sections.forEach(sec => {
                if (category === 'all' || sec.getAttribute('data-category') === category) {
                    sec.style.display = 'block';
                } else {
                    sec.style.display = 'none';
                }
            });
        });
    });

    // Code copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.code-container').querySelector('code');
            if (codeBlock) {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    const originalText = btn.textContent;
                    btn.textContent = 'Copied! ✓';
                    btn.style.color = '#4ade80';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.color = '';
                    }, 2000);
                });
            }
        });
    });
});
