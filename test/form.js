import Vue from 'vue/dist/vue.js';
import FormMixinMaker from '../src/formMixinMaker.js';

const formMixin = FormMixinMaker({ validateCustomMessage: 'Custom validation function error' });
/* eslint-disable no-new */
const FormComponent = Vue.component('form-component', {
  mixins: [formMixin],
  template: `
  <div>

	  <b>Test local error message & validateRequired</b><br/>
	  <input type="text" 
	  	ref="required"
		v-model="required"
		data-validation-definition="validateRequired(required,error='Local error message override')" />
	  <span ref="validation_required">{{ getValidationError('required')}}</span><br/><hr/>

	  <b>Test global error message & validatePositive</b><br/>
	  <input type="text" 
		v-model.number="positive"
		data-validation-definition="validatePositive(positive)"
		data-validation-error="Global error message override" />
	  <span ref="validation_positive">{{ getValidationError('positive')}}</span><hr/>

	  <b>Test global error message & validateCustom</b><br/>
	  <input type="text" 
		v-model.number="custom"
		data-validation-definition="validateCustom(custom)" />
		<span ref="validation_custom">{{ getValidationError('custom')}}</span><br/><hr/>

	  <b>Test validateMinChars</b><br/>
	  <input type="text" 
		v-model="min_chars_8"
		data-validation-definition="validateMinChars(min_chars_8, 8)" />
		<span ref="validation_min_chars_8">{{ getValidationError('min_chars_8')}}</span><br/><hr/>

	  <b>Test validateEqual</b><br/>
	  <input type="text" 
		v-model.number="equal"
		data-validation-definition="validateEqual(equal, this.min_chars_8)" />
		<span ref="validation_equal">{{ getValidationError('equal')}}</span><br/><hr/>

	  <b>Test validateMultipleOf</b><br/>
	  <input type="text" 
		v-model.number="multiple_of_5"
		data-validation-definition="validateMultipleOf(multiple_of_5, 5)" />
		<span ref="validation_multiple_of_5">{{ getValidationError('multiple_of_5')}}</span><br/><hr/>

	  <b>Test validateEmail</b><br/>
	  <input type="text" 
		v-model="email"
		data-validation-definition="validateEmail(email)" />
		<span ref="validation_email">{{ getValidationError('email')}}</span><br/><hr/>

	  <b>Test validation status</b><br/>
	  <span ref="validation_global">{{ validationStatus.valid }}</span>
  </div>
  `,
  data() {
  	return {
  		required: '',
  		positive: -5,
  		custom: 'toto',
  		equal: 'nottoto',
  		min_chars_8: 'not8cha',
  		multiple_of_5: 6,
  		email: 'notanemail@address',
  	};
  },
  methods: {
    validateCustom(number) {
      return number < 190;
    },
  },
});
export default FormComponent;
