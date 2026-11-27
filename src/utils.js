export function replacePlaceholders(pattern, replacements) {
    const regexp = /\$\{([a-zA-Z0-9@?!#*%_.-]+)}/g;
    let matchesArray = [...pattern.matchAll(regexp)];
  
    for (const element of matchesArray) {
      let placeholder = element[0];
      let key = element[1];
      // Only replace if the key exists in the replacements
      if (Object.hasOwn(replacements, key)) {
        // if replacements is an array, use whitespace as a separator with join
        if (Array.isArray(replacements[key])) {
          pattern = pattern.replaceAll(placeholder, replacements[key].join(" "));
        } else {
          pattern = pattern.replaceAll(placeholder, replacements[key]);
        }
      } else {
        pattern = pattern.replaceAll(placeholder, ' '); // Replace unknown placeholders with empty space
      }
    }
    return pattern;
  }
    
function scrollParent(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) return node;
  }
  return null;
}

// Runs a change that expands/collapses content and scrolls so that `anchor`
// (e.g. the "Show all/less" button) stays at the same screen position instead of jumping.
export async function keepInPlace(anchor, change) {
  if (!anchor) return change();
  const before = anchor.getBoundingClientRect().top;
  await change();
  let delta = anchor.getBoundingClientRect().top - before;
  const container = scrollParent(anchor);
  if (delta && container) {
    const start = container.scrollTop;
    container.scrollTop = start + delta;
    delta -= container.scrollTop - start;
  }
  if (delta) window.scrollBy(0, delta);
}
