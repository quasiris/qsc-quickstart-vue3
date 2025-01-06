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
                @update:modelValue="onMenuToggle('start')"
            >
                <template v-slot:activator="{props }">
                <v-text-field
                    label="From"
                    v-model="formattedStartDate"
                    readonly
                    density="compact"
                    v-bind="props"
                    variant="outlined"
                    append-inner-icon="mdi-calendar"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="dateRange.start"
                @update:modelValue="onMenuToggle('end')"
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
                @update:modelValue="onMenuToggle('end')"
            >
                <template v-slot:activator="{props }">
                <v-text-field
                    label="To"
                    v-model="formattedEndDate"
                    readonly
                    density="compact"
                    v-bind="props"
                    variant="outlined"
                    append-inner-icon="mdi-calendar"
                ></v-text-field>
                </template>
                <v-date-picker
                v-model="dateRange.end"
                @update:modelValue="onMenuToggle('start')"
                color="primary"
                ></v-date-picker>
            </v-menu>
        </div>
        <v-btn class="float-right" density="compact" color="primary" @click="submitDateRange">Apply</v-btn>
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
        resetAll: {
            type: Boolean,
        },
    },
    watch: {
      resetAll(newVal) {
        if(newVal){
          this.dateRange= {
            start: null,
            end: null,
          }
        }
      }
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
          ? new Date(this.dateRange.start).toLocaleDateString('de-DE')
          : "";
      },
      formattedEndDate() {
        return this.dateRange.end
          ? new Date(this.dateRange.end).toLocaleDateString('de-DE')
          : "";
      },
    },
    methods: {
      submitDateRange() {
        if(this.dateRange.end && this.dateRange.start){
          let rangeDate={}
          rangeDate.end=new Date(this.dateRange.end).toISOString()
          rangeDate.start=new Date(this.dateRange.start).toISOString()
          let filterValue=this.facet.filterName+'.daterange='+rangeDate.start+','+rangeDate.end
          let chipValue=this.formattedStartDate+' - '+this.formattedEndDate
          this.$emit("updateDateRange", filterValue,chipValue,this.facet);
        }
      },
      onMenuToggle(val) {
        if (val === 'start') 
          this.showEndPicker = false;
        else
          this.showStartPicker = false;
      }
    },
  };
  </script>
  
<style>
    .v-picker-title {
        display: none
    }
</style>
  