import Vue from 'vue/dist/vue.js';
import FormMixinMaker from '../src/formMixinMaker.js';

const formMixin = FormMixinMaker({ validateCustomMessage: 'Custom validation function error' });
/* eslint-disable no-new */
const FormComponent = Vue.component('form-component', {
  mixins: [formMixin],
  template: `
  <div>
	  <input type="text" 
		v-model="firstname"
		data-validation-reference="referenced_firstname"
		data-validation-definition="validateRequired(firstname)" />
		<span ref="validation_firstname">{{ getValidationError('referenced_firstname')}}</span><br/>
	  <input type="text" 
		v-model="lastname"
		data-validation-definition="validateRequired(lastname,error='Local error message override')" />
		<span ref="validation_lastname">{{ getValidationError('lastname')}}</span><br/>
	  <input type="text" 
		v-model.number="age"
		data-validation-definition="validatePositive(age)"
		data-validation-error="Global error message override" />
		<span ref="validation_age">{{ getValidationError('age')}}</span><br/>
	  <input type="text" 
		v-model.number="size"
		data-validation-definition="validateCustom(size)" />
		<span ref="validation_size">{{ getValidationError('size')}}</span><br/>
		<hr/>
		<span ref="validation_global">{{ validationStatus.valid }}</span>
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
export default FormComponent;
