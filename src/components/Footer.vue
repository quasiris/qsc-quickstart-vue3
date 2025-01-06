<template>
    <v-footer color="primary">  
      <div class="px-4 py-2 w-100 d-flex align-center">
        <img src="/brand/cloud-v5.png" alt="Logo" style="max-width: 270px;" class="img-fluid"/>
        <v-spacer></v-spacer>
        <div class="text-white ms-2">
          <p class="CopyRight">Copy right reserved © {{ currentYear }} Quasiris GmbH</p>
        </div>
      </div>
    </v-footer>
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
<style lang="scss">
.v-footer {
  padding-top: 3rem;
  max-height: 110px !important;
  padding-bottom:   3rem;
}
.CopyRight {
  margin-bottom: 0px !important ;
  font-size: 14px !important;
  font-weight: bold;
}
</style>
