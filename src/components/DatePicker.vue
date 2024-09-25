<template>
    <v-container>
        <div>
            <v-menu
                v-model="showStartPicker"
                :close-on-content-click="false"
                transition="scale-transition"
                activator="parent"
                offset-y
                min-width="290px"
            >
                <template v-slot:activator="{props }">
                <v-text-field
                    label="From"
                    v-model="formattedStartDate"
                    readonly
                    v-bind="props"
                    prepend-icon="mdi-calendar"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="dateRange.start"
                @change="updateStartDate"
                no-title
                color="primary"
                ></v-date-picker>
            </v-menu>
            <v-menu
                v-model="showEndPicker"
                :close-on-content-click="false"
                transition="scale-transition"
                activator="parent"
                offset-y
                min-width="290px"
            >
                <template v-slot:activator="{props }">
                <v-text-field
                    label="To"
                    v-model="formattedEndDate"
                    readonly
                    v-bind="props"
                    prepend-icon="mdi-calendar"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="dateRange.end"
                @change="updateEndDate"
                no-title
                color="primary"
                ></v-date-picker>
            </v-menu>
        </div>
        <v-btn class="float-right" color="primary" @click="submitDateRange">Apply</v-btn>
    </v-container>
  </template>
  
  <script>
  export default {
    name: "DatePicker",
    props: {
        facet: {
            type: Object,
            required: true,
        },
    },
    data() {
      return {
        dateRange: {
          start: null,
          end: null,
        },
        showStartPicker: false,
        showEndPicker: false,
      };
    },
    computed: {
      formattedStartDate() {
        return this.dateRange.start
          ? new Date(this.dateRange.start).toLocaleDateString()
          : "";
      },
      formattedEndDate() {
        return this.dateRange.end
          ? new Date(this.dateRange.end).toLocaleDateString()
          : "";
      },
    },
    methods: {
      updateStartDate() {
        this.showStartPicker = false;
      },
      updateEndDate() {
        this.showEndPicker = false;
      },
      submitDateRange() {
        this.$emit("updateDateRange", this.dateRange,this.facet.filterName);
      },
    },
  };
  </script>
  
<style>
    .v-picker-title {
        display: none
    }
</style>
  