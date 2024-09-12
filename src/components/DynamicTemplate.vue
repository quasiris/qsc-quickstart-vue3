<script>
import {compile, h} from "vue";
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
  render() {
    try {
      if(!this.template) {
        return h("h1", "no template provided");
      }
      const compiledRender = compile(this.template);
      return compiledRender({
        ...this.$data,
        document: this.document,
        product: this.product,
      });
    }
    catch (e) {
      console.exception(e.toString())
      return h("div", "Invalid Template")
    }

  }
}
</script>

<style scoped>

</style>