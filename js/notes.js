/**
 * Nimbus Notes & Task Studio - Core App Interactivity
 * Feature Set: LocalStorage Persistence, Search & Tag Filter, Dynamic Categories, Checklists
 */

(function () {
    'use strict';

    const STORAGE_KEY = 'nimbus_notes_studio_v1';
    const THEME_KEY = 'nimbus_notes_theme';

    // Initial Pre-Seeded Practice Notes
    const defaultNotes = [
        {
            id: 'note-1',
            title: '⚡ Nimbus 2.0 JavaScript Architecture Specs',
            category: 'Code',
            priority: 'High',
            accent: 'violet',
            pinned: true,
            tags: ['#javascript', '#nimbus', '#architecture'],
            content: 'Key architecture goals for Nimbus dashboard update:\n- Modular component structure\n- LocalStorage caching layer\n- Theme token dynamic switcher',
            checklist: [
                { text: 'Refactor DOM event listeners into clean modules', completed: true },
                { text: 'Add dark/light theme switcher persistence', completed: true },
                { text: 'Build interactive practice suites for team', completed: false }
            ],
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
            id: 'note-2',
            title: '🎨 UI & Typography Design Guidelines',
            category: 'Work',
            priority: 'Medium',
            accent: 'emerald',
            pinned: true,
            tags: ['#ui-design', '#css', '#fonts'],
            content: 'Always use clean font fallbacks: Inter, Plus Jakarta Sans, or System UI fonts.\nMaintain consistent glassmorphism effects and neon accent glows.',
            checklist: [
                { text: 'Verify color contrast ratio >= 4.5:1', completed: true },
                { text: 'Implement subtle hover micro-animations', completed: true }
            ],
            createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        {
            id: 'note-3',
            title: '🚀 Launch Checklist & QA Audit',
            category: 'Ideas',
            priority: 'High',
            accent: 'rose',
            pinned: false,
            tags: ['#roadmap', '#qa', '#testing'],
            content: 'Verify all pages link seamlessly across Nimbus Studio app ecosystem.',
            checklist: [
                { text: 'Test ID Card Studio 3D flip card toggle', completed: true },
                { text: 'Test Portfolio Builder interactive skills matrix', completed: true },
                { text: 'Test JS Calculator operations and decimal logic', completed: true },
                { text: 'Test Notes Studio persistence and tag filtering', completed: false }
            ],
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
            id: 'note-4',
            title: '💡 Idea: Automated Task Reminders',
            category: 'Ideas',
            priority: 'Low',
            accent: 'amber',
            pinned: false,
            tags: ['#ideas', '#features'],
            content: 'Explore browser Notification API integration for high-priority task deadlines.',
            checklist: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];

    // State Variables
    let notes = [];
    let currentFilter = 'all'; // 'all', 'pinned', 'tasks', or category name
    let activeTag = null;
    let searchQuery = '';
    let sortMode = 'updated';
    let viewMode = 'grid'; // 'grid' or 'list'

    // DOM Element Cache
    const notesContainer = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const btnClearSearch = document.getElementById('btnClearSearch');
    const sortSelect = document.getElementById('sortSelect');
    const activeFiltersBar = document.getElementById('activeFiltersBar');
    const activeFilterBadge = document.getElementById('activeFilterBadge');
    const btnClearFilter = document.getElementById('btnClearFilter');
    const tagsCloud = document.getElementById('tagsCloud');
    const noteModal = document.getElementById('noteModal');
    const noteForm = document.getElementById('noteForm');
    const checklistItems = document.getElementById('checklistItems');
    const btnAddChecklistItem = document.getElementById('btnAddChecklistItem');
    const toast = document.getElementById('toast');

    // Counts
    const cntAll = document.getElementById('cntAll');
    const cntPinned = document.getElementById('cntPinned');
    const cntTasks = document.getElementById('cntTasks');
    const cntWork = document.getElementById('cntWork');
    const cntPersonal = document.getElementById('cntPersonal');
    const cntCode = document.getElementById('cntCode');
    const cntIdeas = document.getElementById('cntIdeas');

    // Init App
    function init() {
        loadNotes();
        initTheme();
        bindEvents();
        render();
    }

    // Load from LocalStorage
    function loadNotes() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                notes = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse notes from storage', e);
                notes = [...defaultNotes];
            }
        } else {
            notes = [...defaultNotes];
            saveNotes();
        }
    }

    function saveNotes() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }

    // Theme Toggle Logic
    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'theme-dark';
        document.body.className = savedTheme;
    }

    function toggleTheme() {
        if (document.body.classList.contains('theme-dark')) {
            document.body.className = 'theme-light';
            localStorage.setItem(THEME_KEY, 'theme-light');
            showToast('Switched to Light Theme');
        } else {
            document.body.className = 'theme-dark';
            localStorage.setItem(THEME_KEY, 'theme-dark');
            showToast('Switched to Dark Theme');
        }
    }

    // Toast Notification
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    // Filter & Sort Logic
    function getFilteredNotes() {
        return notes.filter(note => {
            // View / Category filter
            if (currentFilter === 'pinned' && !note.pinned) return false;
            if (currentFilter === 'tasks' && (!note.checklist || note.checklist.length === 0)) return false;
            if (['Work', 'Personal', 'Code', 'Ideas'].includes(currentFilter) && note.category !== currentFilter) return false;

            // Tag filter
            if (activeTag && (!note.tags || !note.tags.includes(activeTag))) return false;

            // Search Query
            if (searchQuery.trim() !== '') {
                const q = searchQuery.toLowerCase();
                const titleMatch = note.title.toLowerCase().includes(q);
                const contentMatch = note.content.toLowerCase().includes(q);
                const tagMatch = note.tags && note.tags.some(t => t.toLowerCase().includes(q));
                if (!titleMatch && !contentMatch && !tagMatch) return false;
            }

            return true;
        }).sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1; // Pinned first

            if (sortMode === 'title') {
                return a.title.localeCompare(b.title);
            } else if (sortMode === 'created') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sortMode === 'priority') {
                const map = { High: 3, Medium: 2, Low: 1 };
                return (map[b.priority] || 0) - (map[a.priority] || 0);
            } else {
                // 'updated'
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            }
        });
    }

    // Update Counts & Tags Sidebar
    function updateSidebarStats() {
        cntAll.textContent = notes.length;
        cntPinned.textContent = notes.filter(n => n.pinned).length;
        cntTasks.textContent = notes.filter(n => n.checklist && n.checklist.length > 0).length;
        cntWork.textContent = notes.filter(n => n.category === 'Work').length;
        cntPersonal.textContent = notes.filter(n => n.category === 'Personal').length;
        cntCode.textContent = notes.filter(n => n.category === 'Code').length;
        cntIdeas.textContent = notes.filter(n => n.category === 'Ideas').length;

        // Collect unique tags
        const tagsSet = new Set();
        notes.forEach(note => {
            if (note.tags) note.tags.forEach(t => tagsSet.add(t));
        });

        tagsCloud.innerHTML = '';
        Array.from(tagsSet).sort().forEach(tag => {
            const span = document.createElement('span');
            span.className = `tag-item ${activeTag === tag ? 'active' : ''}`;
            span.textContent = tag;
            span.addEventListener('click', () => {
                activeTag = activeTag === tag ? null : tag;
                render();
            });
            tagsCloud.appendChild(span);
        });
    }

    // Render Cards
    function render() {
        updateSidebarStats();

        // Active Filter Banner
        if (currentFilter !== 'all' || activeTag || searchQuery) {
            activeFiltersBar.style.display = 'flex';
            let labelParts = [];
            if (currentFilter !== 'all') labelParts.push(`View: ${currentFilter}`);
            if (activeTag) labelParts.push(`Tag: ${activeTag}`);
            if (searchQuery) labelParts.push(`Search: "${searchQuery}"`);
            activeFilterBadge.textContent = labelParts.join(' | ');
        } else {
            activeFiltersBar.style.display = 'none';
        }

        const filtered = getFilteredNotes();

        if (filtered.length === 0) {
            notesContainer.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        notesContainer.className = `notes-grid ${viewMode === 'list' ? 'list-view' : ''}`;
        notesContainer.innerHTML = '';

        filtered.forEach(note => {
            const card = document.createElement('div');
            card.className = `note-card accent-${note.accent || 'violet'}`;
            
            // Build checklist HTML
            let checklistHtml = '';
            if (note.checklist && note.checklist.length > 0) {
                checklistHtml = '<div class="card-checklist">';
                note.checklist.forEach((item, idx) => {
                    checklistHtml += `
                        <label class="checklist-row ${item.completed ? 'completed' : ''}" data-note-id="${note.id}" data-item-idx="${idx}">
                            <input type="checkbox" ${item.completed ? 'checked' : ''}>
                            <span>${escapeHtml(item.text)}</span>
                        </label>
                    `;
                });
                checklistHtml += '</div>';
            }

            // Build tags HTML
            let tagsHtml = '';
            if (note.tags && note.tags.length > 0) {
                tagsHtml = '<div class="note-tags">';
                note.tags.forEach(t => {
                    tagsHtml += `<span class="note-tag">${escapeHtml(t)}</span>`;
                });
                tagsHtml += '</div>';
            }

            const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            card.innerHTML = `
                <div class="note-header">
                    <div class="note-title-group">
                        <span class="note-category-badge ${note.category}">${note.category} • ${note.priority || 'Medium'}</span>
                        <h3 class="note-title">${escapeHtml(note.title)}</h3>
                    </div>
                    <button class="pin-btn ${note.pinned ? 'pinned' : ''}" data-id="${note.id}" title="${note.pinned ? 'Unpin Note' : 'Pin Note'}">
                        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    </button>
                </div>

                <div class="note-body">${escapeHtml(note.content)}</div>
                ${checklistHtml}
                ${tagsHtml}

                <div class="note-footer">
                    <span>${formattedDate}</span>
                    <div class="card-actions">
                        <button class="card-act-btn edit" data-id="${note.id}">Edit</button>
                        <button class="card-act-btn delete" data-id="${note.id}">Delete</button>
                    </div>
                </div>
            `;

            // Event Listeners for Card Items
            const pinBtn = card.querySelector('.pin-btn');
            pinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePin(note.id);
            });

            const editBtn = card.querySelector('.edit');
            editBtn.addEventListener('click', () => openModal(note.id));

            const deleteBtn = card.querySelector('.delete');
            deleteBtn.addEventListener('click', () => deleteNote(note.id));

            // Checklist checkbox toggle listeners
            card.querySelectorAll('.checklist-row input').forEach(chk => {
                chk.addEventListener('change', (e) => {
                    const row = e.target.closest('.checklist-row');
                    const nId = row.dataset.noteId;
                    const idx = parseInt(row.dataset.itemIdx, 10);
                    toggleChecklistItem(nId, idx, e.target.checked);
                });
            });

            notesContainer.appendChild(card);
        });
    }

    // Toggle Pin Status
    function togglePin(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            note.pinned = !note.pinned;
            note.updatedAt = new Date().toISOString();
            saveNotes();
            render();
            showToast(note.pinned ? 'Pinned note to top' : 'Unpinned note');
        }
    }

    // Toggle Checklist item
    function toggleChecklistItem(noteId, itemIdx, isChecked) {
        const note = notes.find(n => n.id === noteId);
        if (note && note.checklist && note.checklist[itemIdx] !== undefined) {
            note.checklist[itemIdx].completed = isChecked;
            note.updatedAt = new Date().toISOString();
            saveNotes();
            render();
        }
    }

    // Delete Note
    function deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== id);
            saveNotes();
            render();
            showToast('Note deleted');
        }
    }

    // Modal Builder Logic
    function openModal(editId = null) {
        noteForm.reset();
        checklistItems.innerHTML = '';

        if (editId) {
            const note = notes.find(n => n.id === editId);
            if (!note) return;
            document.getElementById('modalTitle').textContent = 'Edit Note';
            document.getElementById('noteId').value = note.id;
            document.getElementById('inputTitle').value = note.title;
            document.getElementById('selectCategory').value = note.category;
            document.getElementById('selectPriority').value = note.priority || 'Medium';
            document.getElementById('inputTags').value = (note.tags || []).join(', ');
            document.getElementById('inputContent').value = note.content;
            document.getElementById('chkPinned').checked = note.pinned;

            // Accent radio
            const rad = noteForm.querySelector(`input[name="accentColor"][value="${note.accent || 'violet'}"]`);
            if (rad) rad.checked = true;

            // Checklist items
            if (note.checklist) {
                note.checklist.forEach(item => addChecklistRow(item.text, item.completed));
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Create New Note';
            document.getElementById('noteId').value = '';
        }

        noteModal.setAttribute('aria-hidden', 'false');
        noteModal.classList.add('show');
    }

    function closeModal() {
        noteModal.classList.remove('show');
        noteModal.setAttribute('aria-hidden', 'true');
    }

    function addChecklistRow(text = '', completed = false) {
        const div = document.createElement('div');
        div.className = 'builder-row';
        div.innerHTML = `
            <input type="text" placeholder="Task description..." value="${escapeHtml(text)}">
            <button type="button" class="btn-clear-search" style="position:static; font-size:1.4rem;">&times;</button>
        `;
        div.querySelector('button').addEventListener('click', () => div.remove());
        checklistItems.appendChild(div);
    }

    // Save Note Form Submit
    function handleFormSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('noteId').value;
        const title = document.getElementById('inputTitle').value.trim();
        const category = document.getElementById('selectCategory').value;
        const priority = document.getElementById('selectPriority').value;
        const content = document.getElementById('inputContent').value.trim();
        const pinned = document.getElementById('chkPinned').checked;
        const accentRadio = noteForm.querySelector('input[name="accentColor"]:checked');
        const accent = accentRadio ? accentRadio.value : 'violet';

        // Parse tags
        const tagsRaw = document.getElementById('inputTags').value;
        const tags = tagsRaw.split(/[, ]+/).map(t => t.trim()).filter(t => t.length > 0).map(t => t.startsWith('#') ? t : `#${t}`);

        // Parse checklist rows
        const checklist = [];
        checklistItems.querySelectorAll('.builder-row').forEach(row => {
            const val = row.querySelector('input').value.trim();
            if (val) {
                checklist.push({ text: val, completed: false });
            }
        });

        if (id) {
            // Edit existing
            const note = notes.find(n => n.id === id);
            if (note) {
                note.title = title;
                note.category = category;
                note.priority = priority;
                note.content = content;
                note.accent = accent;
                note.pinned = pinned;
                note.tags = tags;
                note.checklist = checklist;
                note.updatedAt = new Date().toISOString();
            }
            showToast('Note updated successfully!');
        } else {
            // Create new
            const newNote = {
                id: 'note-' + Date.now(),
                title,
                category,
                priority,
                content,
                accent,
                pinned,
                tags,
                checklist,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            notes.unshift(newNote);
            showToast('New note created!');
        }

        saveNotes();
        closeModal();
        render();
    }

    // Event Bindings
    function bindEvents() {
        // Theme toggle
        document.getElementById('btnToggleTheme').addEventListener('click', toggleTheme);

        // New Note buttons
        document.getElementById('btnNewNote').addEventListener('click', () => openModal());
        document.getElementById('btnEmptyCreate').addEventListener('click', () => openModal());

        // Close modal
        document.getElementById('btnCloseModal').addEventListener('click', closeModal);
        document.getElementById('btnCancelModal').addEventListener('click', closeModal);

        // Form Submit
        noteForm.addEventListener('submit', handleFormSubmit);

        // Add Checklist row button
        btnAddChecklistItem.addEventListener('click', () => addChecklistRow());

        // Sidebar Navigation filter clicks
        document.querySelectorAll('.sidebar .nav-item[data-filter]').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentFilter = item.dataset.filter;
                render();
            });
        });

        document.querySelectorAll('.sidebar .nav-item[data-category]').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentFilter = item.dataset.category;
                render();
            });
        });

        // Search Input
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            btnClearSearch.hidden = searchQuery === '';
            render();
        });

        btnClearSearch.addEventListener('click', () => {
            searchInput.value = '';
            searchQuery = '';
            btnClearSearch.hidden = true;
            render();
        });

        // Reset filter
        btnClearFilter.addEventListener('click', () => {
            currentFilter = 'all';
            activeTag = null;
            searchQuery = '';
            searchInput.value = '';
            btnClearSearch.hidden = true;
            document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
            document.querySelector('.sidebar .nav-item[data-filter="all"]').classList.add('active');
            render();
        });

        // Sort Select
        sortSelect.addEventListener('change', (e) => {
            sortMode = e.target.value;
            render();
        });

        // View Mode Group
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                viewMode = btn.dataset.view;
                render();
            });
        });
    }

    // Helper: Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Run when DOM is ready
    document.addEventListener('DOMContentLoaded', init);

})();
