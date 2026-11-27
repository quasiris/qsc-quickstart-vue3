<script>
import {compile, h} from "vue";

// Helpers available inside config templates, e.g. {{ stripHtml(document.description) }}
const templateHelpers = {
  stripHtml(value) {
    if (value == null) return '';
    const text = Array.isArray(value) ? value.join(' ') : String(value);
    return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  },
  join(value, separator = ', ') {
    return Array.isArray(value) ? value.join(separator) : (value ?? '');
  },
  // Flattens values/arrays into a de-duplicated list of non-empty strings:
  // tags(document.type, document.features).slice(0, 3)
  tags(...values) {
    const out = [];
    values.flat(Infinity).forEach(v => {
      const text = v == null ? '' : String(v).trim();
      if (text && !out.some(t => t.toLowerCase() === text.toLowerCase())) out.push(text);
    });
    return out;
  },
  // First path of a flattened category list where every path starts with `root`,
  // e.g. ['LiveDE', 'A', 'B', 'LiveDE', 'C'] -> ['A', 'B']
  categoryPath(value, root) {
    if (!Array.isArray(value)) return value ? [String(value)] : [];
    const start = root ? value.indexOf(root) + 1 : 0;
    const end = root ? value.indexOf(root, start) : -1;
    return value.slice(start, end === -1 ? undefined : end);
  },
};
export default {
  name: "DynamicTemplate",
  props: {
    template: {
      default: ''
    },
    document: {
      type: Object,
      default: () => {}
    },
    product: {
      type: Object,
      default: () => {}
    }
  },
  created() {
    // non-reactive compile cache (see render)
    this.compiledTemplate = null;
    this.compiledRender = null;
    this.renderCache = [];
  },
  render() {
    try {
      if(!this.template) {
        return h("h1", "no template provided");
      }
      // Compile once per template; the render function caches static nodes and
      // handlers in its second argument, so it needs a persistent cache array.
      if (this.compiledTemplate !== this.template) {
        this.compiledRender = compile(this.template);
        this.compiledTemplate = this.template;
        this.renderCache = [];
      }
      return this.compiledRender({
        ...this.$data,
        ...templateHelpers,
        config: this.document,
        document: this.product,
      }, this.renderCache);
    }
    catch (e) {
      console.error(e)
      return h("div", "Invalid Template")
    }

  }
}
</script>

<style scoped>

</style>