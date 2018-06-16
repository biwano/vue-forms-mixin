import FormComponent from './form.js';
import Vue from 'vue/dist/vue.js';

describe('FormComponent', () => {
  it('should validate inputs', () => {
  	const Constructor = Vue.extend(FormComponent);
  	const vm = new Constructor().$mount();
  	Vue.nextTick(() => {
      expect(vm.$refs.validation_firstname.innerHTML).toBe('');
      expect(vm.$refs.validation_lastname.innerHTML).toBe('Local error message override');
      expect(vm.$refs.validation_age.innerHTML).toBe('Global error message override');
      expect(vm.$refs.validation_size.innerHTML).toBe('Custom validation function error');
      expect(vm.$refs.validation_global.innerHTML).toBe('false');
    });
  });
});
