import Vue from 'vue/dist/vue.js';
import FormMixinMaker from '../src/formMixinMaker.js';

const formMixin = FormMixinMaker({ validateCustomMessage: 'Custom validation function error' });
/* eslint-disable no-new */
new Vue({
  el: '#app',
  mixins: [formMixin],
  template: `
  <div>
	  <input type="text" 
		v-model="firstname"
		data-validation-reference="referenced_firstname"
		data-validation-definition="validateRequired(firstname)" />
		{{ getValidationError('referenced_firstname')}}<br/>
	  <input type="text" 
		v-model="lastname"
		data-validation-definition="validateRequired(lastname,error='Local error message override')" />
		{{ getValidationError('lastname')}}<br/>
	  <input type="text" 
		v-model.number="age"
		data-validation-definition="validatePositive(age)"
		data-validation-error="Global error message override" />
		{{ getValidationError('age')}}<br/>
	  <input type="text" 
		v-model.number="size"
		data-validation-definition="validateCustom(size)" />
		{{ getValidationError('size')}}<br/>
		<hr/>
		{{ validationStatus.valid }}
  </div>
  `,
  data() {
  	return {
  		firstname: 'John',
  		lastname: '',
  		age: -5,
  		size: 200,
  	};
  },
  methods: {
    validateCustom(size) {
      return size < 190;
    },
  },
});
