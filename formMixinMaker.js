
const maker = function maker(config_) {
  // Default config
  const config = {
    classSuccess: 'success',
    classError: 'error',
    definitionsProperty: 'validation',
    errorRequired: 'This field is required',
  };
  // Overiding default config
  Object.assign(config, config_);
  return {
    mounted() {
      this.$mountValidation();
    },
    methods: {
      // mouunt
      $mountElementValidation(element, validationInputs) {
        const res = this.$bindValidation(element);
        if (res !== undefined) { 
          validationInputs[res.model] = res; 
        }
        for (let i = 0 ; i <element.children.length;i=i+1) {
          this.$mountElementValidation(element.children[i], validationInputs);
        }
      
      },
      $mountValidation() {
        // Adding validation Element
        this.validationInputs = {};
        // Binding validation watchers to inputs with valiation data
        this.$mountElementValidation(this.$el, this.validationInputs)
      },
      $getValidationLine(data) {
        const regEx = /(.*)\(([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*).*\)/;
        const match = regEx.exec(data);
        if (match != null) {
          const method = match[1];
          const model = match[2];
          const params = [];
          const valid = true;
          const error = undefined;
          for (let i = 3; i < match.length; i += 1) {
            params.push(match[i]);
          }
          return { model, method, params, valid, error };
        }
        return undefined;
      },
      $getValidationLines(input) {
        const keys = Object.keys(input.dataset);
        const lines = [];
        for (let i = 0; i < keys.length; i += 1) {
          const key = keys[i];
          if (key.startsWith('validation')) {
            const line = this.$getValidationLine(input.dataset[key]);
            if (line !== undefined) lines.push(line);
          }
        }
        return lines;
      },
      $validateLine(line, value) {
        const params_ = [];
        for (let i = 0; i < line.params.length; i += 1) {
          // eslint-disable-next-line
          params_.push(eval(line.params[i]))
        }
        const valid = this[line.method](value, params_);
        let error;
        if (!valid) error = config[`error${line.method}`];
        Object.assign(line, { valid, error });
        return valid;
      },
      $validateLines(lines) {
        let valid = true;
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          // eslint-disable-next-line
          const res = this.$validateLine(line, eval(`this.${line.model}`))
          if (!res) valid = false;
        }
        return valid;
      },
      $validateInput(validationInput) {
        // Evaluating params in real time
        const valid = this.$validateLines(validationInput.lines);
        let error;
        if (valid === true) {
          validationInput.input.classList.remove(config.classError);
          validationInput.input.classList.add(config.classSuccess);
        } else {
          validationInput.input.classList.remove(config.classSuccess);
          validationInput.input.classList.add(config.classError);
          error = '';
          for (let i = 0; i < validationInput.lines.length; i += 1) {
            const line = validationInput.lines[i];
            if (line.error !== undefined) { error = `${error}${line.error}`; }
          }
        }
        validationInput.valid = valid;
        validationInput.error = error;
      },
      // reads input data-valiation field and bind watcher
      $bindValidation(input) {
        let validationInput;
        const lines = this.$getValidationLines(input);
        // 3 parameters max
        if (lines.length > 0) {
          validationInput = { input, lines };
          this.$validateInput(validationInput);
          this.$watch(lines[0].model, () => {
            this.$validateInput(validationInput);
          });
        }
        return validationInput;
      },
      // Returns class for an email Field
      valiateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      },
      // Returns class for a required textfield
      validateMinChars(text, minChars_) {
        let minChars = minChars_;
        if (minChars === undefined) minChars = 1;
        const valueOk = text !== undefined && text.length >= minChars;
        return valueOk;
      },
      validateRequired(text) {
        return this.validateMinChars(text, 1);
      },
      // Returns class for a number greater than
      validateGreaterThan(number, params) {
        return number !== undefined && number > params[0];
      },
      // Returns class for a positive number
      validatePositive(number) {
        return this.FormGreaterThan(number);
      },
      // Returns class for a number positive and multiple of another number
      validatePositiveMultipleOf(number, mod, returnBoolean) {
        return this.formClassReturn_(number > 0 && number % mod === 0, returnBoolean);
      },

      // Returns class for fields with same value
      valiateEqual(text1, text2, returnBoolean) {
        return this.formClassReturn_(text1 === text2, returnBoolean);
      },
    },
    computed: {
      validation() {
        const validation = {
          valid: true,
          inputs: Object.assign({}, this.validationInputs),
        };
        for (let i = 0; i < validation.inputs.length; i += 1) {
          if (!validation.inputs[i].valid) {
            validation.valid = false;
            break;
          }
        }
        return validation;
      },
    },
  };
};
export default maker;
