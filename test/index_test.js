import FormComponent from './form.js';
import Vue from 'vue/dist/vue.js';
import defaultConfig from '../src/defaultConfig.js';

describe('FormComponent', () => {
  // Make the tests fail on console errors
  const oldError = console.error;
  beforeEach(() => {
    console.error = function (message) {
      alert('a');
      throw new Error(message);
    };
  });
  afterEach(() => console.error = oldError);

  // The tests
  it('should validate inputs', () => {
  	// Mounting view
  	const Constructor = Vue.extend(FormComponent);
  	const vm = new Constructor().$mount();
  	vm.$nextTick(() => {
  	  // Testing test component structure
      expect(vm.$refs.required).toBeDefined();
      expect(vm.$refs.required_success).toBeDefined();
      expect(vm.$refs.validation_required).toBeDefined();
      expect(vm.$refs.validation_positive).toBeDefined();
      expect(vm.$refs.validation_custom).toBeDefined();
      expect(vm.$refs.validation_equal).toBeDefined();
      expect(vm.$refs.validation_min_chars_8).toBeDefined();
      expect(vm.$refs.validation_multiple_of_5).toBeDefined();
      expect(vm.$refs.validation_email).toBeDefined();
      expect(vm.$refs.validation_global).toBeDefined();

      // Testing class setup
  	  expect(vm.$refs.required_success.classList.contains(defaultConfig.classSuccess)).toBe(true);
      expect(vm.$refs.required_success.classList.contains(defaultConfig.classError)).toBe(false);
      expect(vm.$refs.required.classList.contains(defaultConfig.classError)).toBe(true);
      expect(vm.$refs.required.classList.contains(defaultConfig.classSuccess)).toBe(false);

      // Testing error messages
      expect(vm.$refs.validation_required.innerHTML).toBe('Local error message override');
      expect(vm.$refs.validation_positive.innerHTML).toBe('Global error message override');
      expect(vm.$refs.validation_custom.innerHTML).toBe('Custom validation function error');
      expect(vm.$refs.validation_equal.innerHTML).toBe(defaultConfig.validateEqualMessage);

      expect(vm.$refs.validation_min_chars_8.innerHTML).toBe(defaultConfig.validateMinCharsMessage);
      expect(vm.$refs.validation_multiple_of_5.innerHTML).toBe(defaultConfig.validateMultipleOfMessage);
      expect(vm.$refs.validation_email.innerHTML).toBe(defaultConfig.validateEmailMessage);

      // Testing global validation error
  	  expect(vm.$refs.validation_global.innerHTML).toBe('false');

      vm.required = 'doe';
      vm.positive = 10;
      vm.custom = 189;
      vm.equal = 'has8chars';
      vm.min_chars_8 = 'has8chars';
      vm.multiple_of_5 = 15;
      vm.embedded.email = 'john.doe@doe.com';
      vm.$nextTick(() => {
     	  // Testing success class setup
  	 	  expect(vm.$refs.required.classList.contains('success')).toBe(true);
	      // Testing validation success
  	 	  expect(vm.$refs.validation_required.innerHTML).toBe('');
	      expect(vm.$refs.validation_positive.innerHTML).toBe('');
	      expect(vm.$refs.validation_custom.innerHTML).toBe('');
	      expect(vm.$refs.validation_equal.innerHTML).toBe('');

	      expect(vm.$refs.validation_min_chars_8.innerHTML).toBe('');
	      expect(vm.$refs.validation_multiple_of_5.innerHTML).toBe('');
	      expect(vm.$refs.validation_email.innerHTML).toBe('');

	      // Testing global validation success
	      expect(vm.$refs.validation_global.innerHTML).toBe('true');
      });
    });
  });
});
