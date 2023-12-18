<template>
  <v-dialog
    :value="value"
    persistent
    max-width="680px"
  >
    <v-card
      outlined
      class="pa-4 text-center"
    >
      <v-card-title>Upload Report</v-card-title>
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="validate"
      >
        <v-select
          v-model="report.reportTypeValue"
          :items="reportTypeOptions"
          :rules="rules.select"
          item-text="label"
          item-value="value"
          required
          label="Report Type"
          dense
          outlined
        />
        <v-menu
          ref="menu"
          v-model="menu"
          :close-on-content-click="false"
          :return-value.sync="date"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="auto"
        >
          <template #activator="{ on, attrs }">
            <v-text-field
              v-model="date"
              label="Period"
              outlined
              :rules="rules.required"
              required
              dense
              readonly
              v-bind="attrs"
              v-on="on"
            />
          </template>
          <v-date-picker
            v-model="date"
            type="month"
            no-title
            scrollable
            @input="handleDateSelection(date)"
          >
            <v-spacer />
            <v-btn
              text
              color="primary"
              @click="menu = false"
            >
              Cancel
            </v-btn>
            <v-btn
              text
              color="primary"
              @click="$refs.menu.save(date)"
            >
              OK
            </v-btn>
          </v-date-picker>
        </v-menu>
        <v-file-input
          v-model="report.file"
          label="Upload Report file"
          prepend-icon=""
          dense
          required
          :rules="rules.required"
          accept=".csv"
          outlined
        />
        <v-card-actions>
          <v-spacer />
          <v-btn
            depressed
            color="primary"
            :loading="uploadTask.isActive"
            :disabled="!report.file"
            type="submit"
          >
            upload
          </v-btn>
          <v-btn
            depressed
            color="default"
            class="mr-2"
            :disabled="uploadTask.isActive"
            @click="$emit('input', false)"
          >
            cancel
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import { Action, State } from 'vuex-class'

import FormBuilder from '@/components/FormBuilder/FormBuilder.vue'
import { Task } from '@/decorators/task'
import type { IUser } from '@/modules/user/types'

import type { IReportUploadFormData } from '../types'
const namespaces = {
  marketplaceAccounts: 'marketplaceAccounts',
  user: 'user'
}
@Component({
  components: {
    FormBuilder
  }
})
export default class UploadReportDialog extends Vue {
  @State('user', { namespace: namespaces.user }) user!: IUser;
  @State('reportType', { namespace: namespaces.marketplaceAccounts })
  reportType!: any;

  @Action('uploadReport', { namespace: namespaces.marketplaceAccounts })
  uploadReport!: (reportParams: IReportUploadFormData) => Promise<void>;

  @Prop({ required: true }) value!: boolean;

  date = new Date().toISOString().substr(0, 7);
  //  date = '';
  report = {
    file: null,
    reportTypeValue: ''
  };

  valid = false;
  menu = false;
  month = '';
  year = '';

  get rules () {
    return {
      required: [
        (v: string) => !!v || this.$t('pages.errors.rules.fieldRequired')
      ],
      select: [(v: string) => !!v || this.$t('pages.errors.rules.required')]
    }
  }

  @Task('initialTask')
  async initialLoad () {
    const currentDate = new Date(this.date)
    this.year = currentDate.getFullYear().toString()
    this.month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
  }

  beforeMount () {
    this.initialLoad()
  }

  get reportTypeOptions () {
    return Object.keys(this.reportType || {}).map((key) => ({
      label: this.reportType?.[key],
      value: key
    }))
  }

  handleDateSelection (date: string | number | Date) {
    const selectedDate = new Date(date)
    this.month = (selectedDate.getMonth() + 1).toString().padStart(2, '0')
    this.year = selectedDate.getFullYear().toString()
  }

  @Task('uploadTask')
  async validate () {
    const { form } = this.$refs as HTMLFormElement
    await form.validate()
    if (this.valid) {
      const reportParams: IReportUploadFormData = {
        file: this.report.file,
        reportType: this.report.reportTypeValue,
        year: this.year,
        month: this.month,
        userId: this.user.id as number
      }
      await this.uploadReport(reportParams)
      this.$emit('input', false)
      this.report.file = null
      this.report.reportTypeValue = ''
    }
  }
}
</script>
