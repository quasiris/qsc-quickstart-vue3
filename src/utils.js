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
    