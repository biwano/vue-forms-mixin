# vue-forms-mixin

## What it does

vue-form-mixin is a simple mixin for vuejs 2 that helps handling form validation and error messages.

## Install

```
npm install --save vue-forms-mixin
```

## Import
```javascript
import FormMixinMaker from 'vue-forms-mixin';
```

## Configure

You basically create the form mixin by calling the FormMixinMaker with configuration parameters:

```javascript
const formMixin = FormMixinMaker({
    classSuccess: 'success',
    classError: 'error',
    validationDefinitionPrefix: 'validationDefinition',
    validationReferencePrefix: 'validationReference',
    validateRequiredMessage: 'This field is required',
});
```

### Overriding classes

You surely have to override add your error and success classes to your inputs:
* classSuccess: class to be appended to input if value is valid
* classError: class to be appended to input if value is invalid

### Overriding error messages

xxxMessage: message to append to validation status in case of error for validation method 'xxx'
xxx is the name of the validation method whose error message you want to override.

### Overriding data attributes

You should not have to do this... but maybe you like shorter syntaxes...
* validationDefinitionPrefix: prefix for validation definition (data-validation-definition="[definition]")
* validationReferencePrefix: prefix for validation reference (data-validation-reference="[reference]")


## Basic Use

* Add the mixin you created to the mixins list of any component
* Use data-validation-reference and data-validation-defintion to bind validation to an input
* use getValidationError(reference) to display error messages

The mixin will bind validation to any html element with a data-validation-definition attribute.
The syntax is `validationMethod(model, param1, param2, param3)`.
The data-validation-reference attribute is used to bind result to a reference, this reference can be used afterwards to access validation attributes in the validation object (see below) or when using the getValidationError method.

Exemple:

```javascript
<template>
  <input type="text"
        v-model="user.name"
        data-validation-reference="user"
        data-validation-definition="validateRequired(user.name)"/>
        {{ getValidationError('user') }}
</template>
<script>
import FormMixin from '@/framework/mixins/formMixin';
const formMixin = FormMixinMaker({
/* Your config goes there */
});

export default {
  name: 'Profile',
  mixins: [formMixin],
  props: ['user'],
}
</script>
```

## Advanced use 

The mixin will generate a computed property called **validation** whose attributes are:

* **valid**: boolean indicating whether all inputs of the form are valid
* **inputs**: an array of validation information (one element per input). The validation information contains the following attributes:
  * **model**: the model being tested
  * **method**: the validation method
  * **params**: the parameters passed to the validation method
  * **valid**: boolean indicating whether the input is valid or not
  * **error**: the error message pertaining to the validation method

Use this property however you like to do whatever you please.

## Existing validation methods:

* validateEmail(email): Validates 'email' is an email address 
* validateMinChars(text, minChars): Validates that 'text' has at least 'minChars' characters 
* validateRequired(text): Validates that 'text' has at least one char
* validateGreaterThan(number, min): Validates that 'number' is greater than 'min'
* validatePositive(number): Validates that 'number' is greater then zero
* validateMultipleOf(number, mod): validates than 'number' is a multiple of 'mod'
* validateEqual(text1, text2): Validates that 'text1' equals 'text2'

## FAQ

### Can I add my own validation functions
Yes, just drop the validation functions in your component either directly or using your own mixin. Please note that your function signature must be `function validateCustom(model, params)``` where params will be an array containing the arguments passed in the validationDefinition attribute. 
You can also add error messages for your custom functions using the configuration object.