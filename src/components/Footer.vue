<template>
  <footer class="app-footer">
    <div class="qs-container app-footer__inner">
      <img src="/brand/qsc-logo.png" alt="Quasiris Search Cloud" class="app-footer__logo" />
      <p class="app-footer__copy">© {{ currentYear }} Quasiris GmbH · Powered by Quasiris Search Cloud</p>
    </div>
  </footer>
</template>
<script>
export default {
  name: "qsc-footer",
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
};
</script>
<style>
.app-footer {
  margin-top: auto;
  background: #fff;
  border-top: 1px solid var(--qs-border);
  color: var(--qs-muted);
}
.app-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding-top: 20px;
  padding-bottom: 20px;
}
.app-footer__logo {
  height: 30px;
  width: auto;
}
.app-footer__copy {
  margin: 0;
  font-size: 13px;
}
</style>
