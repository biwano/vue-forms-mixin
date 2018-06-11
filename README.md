# vue-forms-mixin

## What it does

vue-form-mixin is a simple mixin for vuejs 2 doing some boilerplate job to handle form validation.

## Install

npm install --save vue-forms-mixin

## Import
```
import FormMixinMaker from 'vue-forms-mixin';

const formMixin = FormMixinMaker({
    // Class to be appended to input if value is valid
    classSuccess: 'success',
    // Class to be appended to input if value is valid
    classError: 'error',
    // Prefix for validation definition (data-validation-definition="[definition]")
    validationDefinitionPrefix: 'validationDefinition',
    // Prefix for validation reference (data-validation-reference="[reference]")
    validationReferencePrefix: 'validationReference',
    // Message to append to validation status in case of error for validation method 'xxx'
    validateRequiredMessage: 'This field is required',
});
```

## Use it

```
<template>
  <input type="text"
        v-model="user.name"
        data-validation-reference="user"
        data-validation-definition="validateRequired(user.name)"/>
        {{ getValidationError('user') }}
</template>
<script>
import FormMixin from '@/framework/mixins/formMixin';
import roundModels from '@/business/roundModels';
import PlayerChooser from '@/components/player/playerChooser';

export default {
  name: 'TournamentConfig',
  mixins: [formMixin],
  props: ['user'],
}
</script>
```

## FAQ

### Can I add my own validation functions
Yes, just drop the validation functions in your component either directly or using your own mixin
You can also add error messages for your custom functions using the config file