// Builds a formMixin given a configuration
const maker = function maker(config_) {
  // Default config
  const config = {
    // Class to be appended to input if value is valid
    classSuccess: 'success',
    // Class to be appended to input if value is valid
    classError: 'error',
    // Prefix for validation definition (data-validation-definition="[definition]")
    validationDefinitionPrefix: 'validationDefinition',
    // Prefix for validation reference (data-validation-reference="[reference]")
    validationReferencePrefix: 'validationReference',
    // Prefix for validation error message (data-validation-error="[error]")
    validationErrorPrefix: 'validationError',
    // Message to append to validation status in case of error for validation method 'xxx'
    validateRequiredMessage: 'This field is required',
    validatePositiveMessage: 'This field must be positive',
    validateMultipleOfMessage: 'This field must be a multiple of... a certain number',
    validateEqualMessage: 'This field must be equal to... that another field',
  };
  // Overiding default config
  Object.assign(config, config_);

  return {
    data() {
      return {
        validationInputs: {},
      };
    },
    mounted() {
      this.$mountValidation();
    },
    methods: {
      // Mount the validation of all elements recursively
      $mountElementValidation(element) {
        const res = this.$bindValidation(element);
        if (res !== undefined) {
          this.$set(this.validationInputs, res.reference, res);
        }
        for (let i = 0; i < element.children.length; i += 1) {
          this.$mountElementValidation(element.children[i]);
        }
      },
      // Mount the validation of all elements recursively
      $mountValidation() {
        this.$mountElementValidation(this.$el);
      },
      // Computes the validation line of an input
      $getValidationLine(data) {
        const regEx = /(.*)\(([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*).*\)/;
        const match = regEx.exec(data);
        if (match != null) {
          const method = match[1];
          const model = match[2];
          const params = [];
          const valid = true;
          const error = undefined;
          let customErrorMessage;
          for (let i = 3; i < match.length; i += 1) {
            // Spécial parameter
            if (match[i].includes('=')) {
              const split = match[i].split('=');
              const key = split[0];
              const value = split[1];
              if (key == 'error') customErrorMessage = value;
              else console.warn(`Data validation special parameter '${key}' cannot be parsed in '${data}'`);
            } else {
              params.push(match[i]);
            }
          }
          return {
            model, method, params, valid, error, customErrorMessage,
          };
        }
        console.warn(`Data validation line cannot be parsed: ${data}`);
        return undefined;
      },
      // Get the validation lines of an input
      $getValidationLines(input) {
        const keys = Object.keys(input.dataset);
        const lines = [];
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          if (key.startsWith(config.validationDefinitionPrefix)) {
            const line = this.$getValidationLine(input.dataset[key]);
            if (line !== undefined) lines.push(line);
          }
        }
        return lines;
      },
      // Computes the validation status of a validation line of an input
      $validateLine(line) {
        const params_ = [];
        // Computing value and params in real time
        for (let i = 0; i < line.params.length; i += 1) {
          // eslint-disable-next-line
          params_.push(eval(line.params[i]))
        }
        const value = eval(`this.${line.model}`);
        // Setting valid and error values for line
        const valid = this[line.method](value, params_);
        let error;
        if (!valid) {
          if (line.customErrorMessage === undefined) error = config[`${line.method}Message`];
          else error = eval(line.customErrorMessage);
        }
        Object.assign(line, { valid, error });
        return valid;
      },
      // Computes the validation status of validation lines of an input
      $validateLines(lines) {
        let valid = true;
        // Validate each line against model computed in real time
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          // eslint-disable-next-line
          const res = this.$validateLine(line);
          if (!res) valid = false;
        }
        return valid;
      },
      // Computes the validation status of an input
      $validateInput(validationInput) {
        const valid = this.$validateLines(validationInput.lines);
        let error;
        // Sets up class on input element
        if (valid === true) {
          validationInput.input.classList.remove(config.classError);
          validationInput.input.classList.add(config.classSuccess);
        } else {
          validationInput.input.classList.remove(config.classSuccess);
          validationInput.input.classList.add(config.classError);

          if (!valid)
          // Sets Override error message if available
          {
            if (validationInput.customErrorMessage !== undefined) {
              error = validationInput.customErrorMessage;
            } else {
              error = '';
              // Sets errors depending on lines status
              for (let i = 0; i < validationInput.lines.length; i += 1) {
                const line = validationInput.lines[i];
                if (line.error !== undefined) { error = `${i !== 0 ? ',' : ''}${error}${line.error}`; }
              }
            }
          }
        }
        validationInput.valid = valid;
        validationInput.error = error;
      },
      // Tries to bind validation on an html element
      $bindValidation(input) {
        let validationInput;
        const lines = this.$getValidationLines(input);
        if (lines.length > 0) {
          let reference = input.dataset[config.validationReferencePrefix];
          const customErrorMessage = input.dataset[config.validationErrorPrefix];
          if (reference === undefined) reference = lines[0].model;
          validationInput = {
            reference, input, lines, customErrorMessage,
          };
          // Initial validation
          this.$validateInput(validationInput);
          // Validation for each model bound to this input
          for (let i = 0; i < lines.length; i += 1) {
            this.$watch(lines[i].model, () => {
              this.$validateInput(validationInput);
              this.validationInputs = Object.assign({}, this.validationInputs);
            });
          }
        }
        return validationInput;
      },
      // Built-in validation functions
      validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
      validateMinChars(text, minChars_) {
        let minChars = minChars_;
        if (minChars === undefined) minChars = 1;
        const valueOk = text !== undefined && text.length >= minChars;
        return valueOk;
      },
      validateRequired(text) {
        return this.validateMinChars(text, 1);
      },
      validateGreaterThan(number, params) {
        return number !== undefined && number > params[0];
      },
      validatePositive(number) {
        return this.validateGreaterThan(number, [0]);
      },
      validateMultipleOf(number, mod, returnBoolean) {
        return this.formClassReturn_(number % mod === 0, returnBoolean);
      },
      validateEqual(text1, text2, returnBoolean) {
        return this.formClassReturn_(text1 === text2, returnBoolean);
      },
      getValidationError(reference) {
        const input = this.validationStatus.inputs[reference];
        return input !== undefined ? input.error : '';
      },
    },
    computed: {
      // Computes validation object
      validationStatus() {
        const validation = {
          valid: true,
          inputs: this.validationInputs,
        };
        if (this.validationInputs !== undefined) {
          for (const i in validation.inputs) {
            if (!validation.inputs[i].valid) {
              validation.valid = false;
              break;
            }
          }
        }
        return validation;
      },
    },
  };
};
export default maker;
