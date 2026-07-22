// Mobile CSS Inspector for SillyTavern
// Lets you tap any element on screen to see its CSS selector + computed styles,
// so you can write custom CSS without needing desktop devtools.

const MODULE_NAME = 'mobile_css_inspector';

const defaultSettings = Object.freeze({
    enabled: false,
    showComputed: true,
});

function getSettings() {
    const context = SillyTavern.getContext();
    if (!context.extensionSettings[MODULE_NAME]) {
        context.extensionSettings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    for (const key of Object.keys(defaultSettings)) {
        if (!Object.hasOwn(context.extensionSettings[MODULE_NAME], key)) {
            context.extensionSettings[MODULE_NAME][key] = defaultSettings[key];
        }
    }
    return context.extensionSettings[MODULE_NAME];
}

function persistSettings() {
    const { saveSettingsDebounced } = SillyTavern.getContext();
    saveSettingsDebounced();
}

// A curated list of properties that matter most when writing theme CSS.
const STYLE_PROPS = [
    'color',
    'background-color',
    'font-size',
    'font-family',
    'font-weight',
    'line-height',
    'padding',
    'margin',
    'border',
    'border-radius',
    'display',
    'position',
    'width',
    'height',
];

let fabEl = null;
let highlightEl = null;
let panelEl = null;

function cssEscape(str) {
    return (window.CSS && typeof CSS.escape === 'function')
        ? CSS.escape(str)
        : String(str).replace(/([^\w-])/g, '\\$1');
}

// Builds a short selector for just the tapped element (tag#id.class1.class2)
function shortSelector(el) {
    let part = el.tagName.toLowerCase();
    if (el.id) {
        part += `#${cssEscape(el.id)}`;
    }
    const classes = Array.from(el.classList || []).filter(Boolean);
    if (classes.length) {
        part += '.' + classes.map(cssEscape).join('.');
    }
    return part;
}

// Builds a full, more unique selector path from the nearest ancestor with an ID
// (or the document root) down to the tapped element.
function fullSelectorPath(el) {
    const path = [];
    let current = el;
    let depth = 0;

    while (current && current.nodeType === Node.ELEMENT_NODE && depth < 12) {
        let part = current.tagName.toLowerCase();

        if (current.id) {
            part += `#${cssEscape(current.id)}`;
            path.unshift(part);
            break; // an ID is specific enough, no need to climb further
        }

        const classes = Array.from(current.classList || []).filter(Boolean);
        if (classes.length) {
            part += '.' + classes.map(cssEscape).join('.');
        }

        const parent = current.parentElement;
        if (parent) {
            const sameTagSiblings = Array.from(parent.children).filter(s => s.tagName === current.tagName);
            if (sameTagSiblings.length > 1) {
                part += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
            }
        }

        path.unshift(part);
        current = current.parentElement;
        depth++;
    }

    return path.join(' > ');
}

function isOwnElement(el) {
    return !!(el && el.closest && el.closest('#mci-panel, #mci-fab, #mci-highlight'));
}

function ensureUi() {
    if (fabEl) {
        return;
    }

    fabEl = document.createElement('div');
    fabEl.id = 'mci-fab';
    fabEl.title = 'Toggle CSS Inspector';
    fabEl.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    document.body.appendChild(fabEl);

    fabEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleInspector();
    });

    highlightEl = document.createElement('div');
    highlightEl.id = 'mci-highlight';
    highlightEl.style.display = 'none';
    document.body.appendChild(highlightEl);

    panelEl = document.createElement('div');
    panelEl.id = 'mci-panel';
    panelEl.style.display = 'none';
    document.body.appendChild(panelEl);
}

function toggleInspector(forceState) {
    const settings = getSettings();
    settings.enabled = typeof forceState === 'boolean' ? forceState : !settings.enabled;
    persistSettings();
    applyState();
}

function applyState() {
    const settings = getSettings();
    ensureUi();
    fabEl.classList.toggle('mci-active', settings.enabled);

    if (!settings.enabled) {
        hideHighlight();
        hidePanel();
    }

    const checkbox = document.getElementById('mci_enabled_checkbox');
    if (checkbox) {
        checkbox.checked = settings.enabled;
    }
}

function hideHighlight() {
    if (highlightEl) {
        highlightEl.style.display = 'none';
    }
}

function hidePanel() {
    if (panelEl) {
        panelEl.style.display = 'none';
    }
}

function showHighlight(el) {
    const rect = el.getBoundingClientRect();
    highlightEl.style.display = 'block';
    highlightEl.style.top = `${rect.top + window.scrollY}px`;
    highlightEl.style.left = `${rect.left + window.scrollX}px`;
    highlightEl.style.width = `${rect.width}px`;
    highlightEl.style.height = `${rect.height}px`;
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => toastr.success('Copied to clipboard'))
            .catch(() => toastr.error('Failed to copy'));
    } else {
        toastr.error('Clipboard API not available');
    }
}

function showPanel(el) {
    const settings = getSettings();
    const full = fullSelectorPath(el);
    const short = shortSelector(el);
    const computed = window.getComputedStyle(el);

    const styleRows = STYLE_PROPS.map((prop) => {
        const value = computed.getPropertyValue(prop) || '(none)';
        return `<div class="mci-row"><span class="mci-prop">${prop}</span><span class="mci-val">${value}</span></div>`;
    }).join('');

    panelEl.innerHTML = `
        <div class="mci-panel-header">
            <span>Element Inspector</span>
            <button id="mci-close-btn" class="mci-icon-btn" type="button"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="mci-panel-body">
            <div class="mci-section">
                <label>Selector</label>
                <div class="mci-code-row">
                    <code>${short}</code>
                    <button class="mci-icon-btn mci-copy-btn" type="button" data-copy-target="short"><i class="fa-solid fa-copy"></i></button>
                </div>
            </div>
            <div class="mci-section">
                <label>Full Path</label>
                <div class="mci-code-row">
                    <code>${full}</code>
                    <button class="mci-icon-btn mci-copy-btn" type="button" data-copy-target="full"><i class="fa-solid fa-copy"></i></button>
                </div>
            </div>
            <div class="mci-section mci-toggle-computed">
                <label><input type="checkbox" id="mci-toggle-computed-cb" ${settings.showComputed ? 'checked' : ''} /> Show computed styles</label>
            </div>
            <div id="mci-computed-styles" class="mci-computed" style="${settings.showComputed ? '' : 'display:none;'}">
                ${styleRows}
            </div>
        </div>
    `;
    panelEl.style.display = 'block';

    panelEl.querySelector('#mci-close-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        hidePanel();
        hideHighlight();
    });

    panelEl.querySelectorAll('.mci-copy-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const target = btn.dataset.copyTarget === 'short' ? short : full;
            copyToClipboard(target);
        });
    });

    const computedCb = panelEl.querySelector('#mci-toggle-computed-cb');
    computedCb.addEventListener('change', (e) => {
        e.stopPropagation();
        const s = getSettings();
        s.showComputed = computedCb.checked;
        persistSettings();
        showPanel(el); // re-render with the new preference
    });
}

function handleDocumentClick(e) {
    const settings = getSettings();
    if (!settings.enabled) {
        return;
    }

    const target = e.target;
    if (isOwnElement(target)) {
        return; // let clicks on our own FAB/panel work normally
    }

    // Swallow the click so it doesn't trigger the underlying button/link/etc.
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    showHighlight(target);
    showPanel(target);
}

function addSettingsUi() {
    const html = `
        <div class="mci-settings inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>Mobile CSS Inspector</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label">
                    <input type="checkbox" id="mci_enabled_checkbox" />
                    <span>Enable inspector (also toggled via the floating magnifying-glass button)</span>
                </label>
                <p class="mci-hint">
                    While inspect mode is on, tapping any element on the page shows its CSS selector
                    and computed styles instead of activating it. Tap the floating button again to turn it off.
                </p>
            </div>
        </div>
    `;
    $('#extensions_settings2').append(html);

    $('#mci_enabled_checkbox').on('change', function () {
        toggleInspector($(this).is(':checked'));
    });
}

function safeCall(label, fn) {
    try {
        fn();
    } catch (err) {
        console.error(`[Mobile CSS Inspector] ${label} failed:`, err);
        if (typeof toastr !== 'undefined') {
            toastr.error(`${label} failed: ${err.message}`, 'Mobile CSS Inspector', { timeOut: 8000 });
        }
    }
}

(function init() {
    // This toast fires no matter what happens next, so you can tell from
    // your phone alone whether the extension script is even executing.
    if (typeof toastr !== 'undefined') {
        toastr.info('Mobile CSS Inspector script loaded', 'Mobile CSS Inspector', { timeOut: 4000 });
    } else {
        console.log('[Mobile CSS Inspector] toastr not available, but script is running');
    }

    safeCall('getSettings', getSettings);
    safeCall('addSettingsUi', addSettingsUi);
    safeCall('ensureUi', ensureUi);
    safeCall('applyState', applyState);

    safeCall('attach click listener', () => {
        // Capture phase so we intercept before any button/link handlers run.
        document.addEventListener('click', handleDocumentClick, true);
    });

    if (fabEl) {
        console.log('[Mobile CSS Inspector] FAB element created and appended:', fabEl.isConnected);
    } else {
        console.error('[Mobile CSS Inspector] FAB element was never created');
    }
})();
