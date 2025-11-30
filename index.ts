const body = document.querySelector('body') as HTMLBodyElement;
body.style.display = 'flex';
body.style.flexDirection = 'column';
body.style.alignItems = 'center';
body.style.height = '100vh';
body.style.gap = '1.5rem';
body.style.margin = '0';
body.style.boxSizing = 'border-box';
body.style.padding = '1rem';

// Resize canvases
for (const canvas of document.querySelectorAll('canvas')) {
  if ('width' in canvas.attributes || 'height' in canvas.attributes) {
    continue; // custom canvas, not replacing with resizable
  }

  const container = document.createElement('div');
  const frame = document.createElement('div');

  canvas.parentElement?.replaceChild(container, canvas);

  frame.appendChild(canvas);
  container.appendChild(frame);

  container.style.display = 'flex';
  container.style.flex = '1';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'top';
  container.style.width = '100%';

  container.style.containerType = 'size';

  frame.style.position = 'relative';

  if (canvas.dataset.fitToContainer !== undefined) {
    frame.style.width = '100%';
    frame.style.height = '100%';
  } else {
    const aspectRatio = canvas.dataset.aspectRatio ?? '1';
    frame.style.aspectRatio = aspectRatio;
    frame.style.height = `min(calc(min(100cqw, 100cqh)/(${aspectRatio})), min(100cqw, 100cqh))`;
  }

  canvas.style.position = 'absolute';
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const onResize = () => {
    canvas.width = frame.clientWidth * window.devicePixelRatio;
    canvas.height = frame.clientHeight * window.devicePixelRatio;
  };

  onResize();
  new ResizeObserver(onResize).observe(container);
}

// Hardcoded control values (adjust these instead of using sliders)
const QUALITY = 'Auto'; // Options: 'Auto', 'Very Low', 'Low', 'Medium', 'High', 'Ultra'
const LIGHT_DIR = 0; // Range: 0 to 1
const JELLY_COLOR: [number, number, number] = [0.08, 0.5, 1]; // RGB values 0-1
const DARK_MODE = true; // true or false

// Execute example
// @ts-expect-error
const example = await import('./src/index.ts');

// Apply hardcoded control values
if (example.controls) {
  // Apply Quality
  if (example.controls.Quality?.onSelectChange) {
    example.controls.Quality.onSelectChange(QUALITY);
  }
  
  // Apply Light Direction
  if (example.controls['Light dir']?.onSliderChange) {
    example.controls['Light dir'].onSliderChange(LIGHT_DIR);
  }
  
  // Apply Jelly Color
  if (example.controls['Jelly Color']?.onColorChange) {
    example.controls['Jelly Color'].onColorChange(JELLY_COLOR);
  }
  
  // Apply Dark Mode
  if (example.controls['Dark Mode']?.onToggleChange) {
    example.controls['Dark Mode'].onToggleChange(DARK_MODE);
  }
}