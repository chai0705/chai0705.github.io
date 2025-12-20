/**
 * Mermaid Diagram Enhancer
 * Adds Mac-style toolbar to mermaid diagrams with copy and fullscreen functionality
 */

import { copyToClipboard } from './code-block-enhancer';

/**
 * Create toolbar HTML for mermaid diagram
 */
function createMermaidToolbar(): string {
  return `
    <div class="mermaid-toolbar">
      <div class="mermaid-dots">
        <span class="mermaid-dot red"></span>
        <span class="mermaid-dot yellow"></span>
        <span class="mermaid-dot green"></span>
        <span class="mermaid-language">mermaid</span>
      </div>
      <div class="mermaid-actions">
        <button
          class="mermaid-button mermaid-fullscreen"
          aria-label="Fullscreen"
          title="Fullscreen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button
          class="mermaid-button mermaid-copy"
          aria-label="Copy source"
          title="Copy source"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 448 512" fill="currentColor">
            <path d="M192 0c-35.3 0-64 28.7-64 64l0 256c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-200.6c0-17.4-7.1-34.1-19.7-46.2L370.6 17.8C358.7 6.4 342.8 0 326.3 0L192 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l192 0c35.3 0 64-28.7 64-64l0-16-64 0 0 16-192 0 0-256 16 0 0-64-16 0z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Create checkmark SVG for copy success state
 */
function createCheckmarkSvg(): string {
  const id = `checkmark-mermaid-${Date.now()}`;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
      <mask id="${id}">
        <g fill="none" stroke="#fff" stroke-dasharray="24" stroke-dashoffset="24" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M2 13.5l4 4l10.75 -10.75">
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0"/>
          </path>
          <path stroke="#000" stroke-width="6" d="M7.5 13.5l4 4l10.75 -10.75">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0"/>
          </path>
          <path d="M7.5 13.5l4 4l10.75 -10.75">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="24;0"/>
          </path>
        </g>
      </mask>
      <rect width="24" height="24" fill="currentColor" mask="url(#${id})"/>
    </svg>`;
}

/**
 * Enhance a single mermaid diagram with toolbar
 */
function enhanceMermaidDiagram(mermaidElement: HTMLElement): void {
  // Skip if already enhanced
  if (mermaidElement.dataset.toolbarEnhanced === 'true') {
    return;
  }

  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'mermaid-wrapper';

  // Wrap the mermaid element
  mermaidElement.parentNode?.insertBefore(wrapper, mermaidElement);
  wrapper.appendChild(mermaidElement);

  // Insert toolbar before mermaid
  mermaidElement.insertAdjacentHTML('beforebegin', createMermaidToolbar());

  // Mark as enhanced
  mermaidElement.dataset.toolbarEnhanced = 'true';

  // Get source code from data-diagram attribute (set by astro-mermaid)
  const source = mermaidElement.getAttribute('data-diagram') || mermaidElement.textContent || '';

  // Bind copy button
  const copyBtn = wrapper.querySelector('.mermaid-copy');
  if (copyBtn) {
    const originalSvg = copyBtn.innerHTML;
    copyBtn.addEventListener('click', async () => {
      const success = await copyToClipboard(source);
      if (success) {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = createCheckmarkSvg();
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          copyBtn.innerHTML = originalSvg;
        }, 2000);
      }
    });
  }

  // Bind fullscreen button
  const fullscreenBtn = wrapper.querySelector('.mermaid-fullscreen');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      // Get the rendered SVG (innerHTML after astro-mermaid processes it)
      const svg = mermaidElement.innerHTML;

      // Dispatch custom event with mermaid data
      window.dispatchEvent(
        new CustomEvent('open-mermaid-fullscreen', {
          detail: { svg, source },
        }),
      );
    });
  }
}

/**
 * Wait for mermaid diagrams to be processed and enhance them
 */
function waitAndEnhance(): void {
  const mermaidElements = document.querySelectorAll('pre.mermaid');

  mermaidElements.forEach((element) => {
    const mermaidElement = element as HTMLElement;

    // If already processed (has SVG content), enhance immediately
    if (mermaidElement.getAttribute('data-processed') === 'true') {
      enhanceMermaidDiagram(mermaidElement);
    } else {
      // Wait for astro-mermaid to process it
      const observer = new MutationObserver((mutations, obs) => {
        for (const mutation of mutations) {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'data-processed' &&
            mermaidElement.getAttribute('data-processed') === 'true'
          ) {
            enhanceMermaidDiagram(mermaidElement);
            obs.disconnect();
            return;
          }
        }
      });

      observer.observe(mermaidElement, {
        attributes: true,
        attributeFilter: ['data-processed'],
      });

      // Timeout fallback - if not processed in 5 seconds, enhance anyway
      setTimeout(() => {
        observer.disconnect();
        if (mermaidElement.dataset.toolbarEnhanced !== 'true') {
          enhanceMermaidDiagram(mermaidElement);
        }
      }, 5000);
    }
  });
}

/**
 * Initialize mermaid enhancer
 */
export function initMermaidEnhancer(): void {
  // Small delay to let astro-mermaid start processing
  setTimeout(waitAndEnhance, 100);
}
