/**
 * Image loading enhancement
 * Adds loaded/error states for smooth image transitions
 */

/**
 * Create accessible error placeholder for failed images
 */
function createErrorPlaceholder(img: HTMLImageElement): HTMLElement {
  const placeholder = document.createElement('div');
  placeholder.className = 'markdown-image-error';
  placeholder.setAttribute('role', 'img');
  placeholder.setAttribute('aria-label', img.alt ? `图片加载失败: ${img.alt}` : '图片加载失败');

  // Icon
  const icon = document.createElement('span');
  icon.className = 'markdown-image-error-icon';
  icon.setAttribute('aria-hidden', 'true');

  // Text
  const text = document.createElement('span');
  text.className = 'markdown-image-error-text';
  text.textContent = '图片加载失败';

  placeholder.appendChild(icon);
  placeholder.appendChild(text);

  return placeholder;
}

export function enhanceImages(container: Element): void {
  const images = container.querySelectorAll<HTMLImageElement>('.markdown-image');

  images.forEach((img) => {
    // Skip if already enhanced
    if (img.dataset.enhanced === 'true') return;
    img.dataset.enhanced = 'true';

    // Check if already loaded (cached images)
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add('loaded');
      return;
    }

    // Check if already errored (broken image)
    if (img.complete && img.naturalWidth === 0) {
      handleImageError(img);
      return;
    }

    // Handle load event
    img.addEventListener(
      'load',
      () => {
        img.classList.add('loaded');
      },
      { once: true },
    );

    // Handle error event
    img.addEventListener(
      'error',
      () => {
        handleImageError(img);
      },
      { once: true },
    );
  });
}

function handleImageError(img: HTMLImageElement): void {
  img.classList.add('error');

  // Add accessible error placeholder
  const wrapper = img.closest('.markdown-image-wrapper');
  if (wrapper && !wrapper.querySelector('.markdown-image-error')) {
    const placeholder = createErrorPlaceholder(img);
    wrapper.appendChild(placeholder);
  }
}
