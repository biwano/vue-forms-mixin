import Vue from 'vue/dist/vue.js';
import FormComponent from './form.js';

/* eslint-disable no-new */
const myVue = new Vue({
  el: '#app',
  template: `
  <form-component></form-component>
  `,
});
export default myVue;
