import defaultConfig from './defaultConfig.js';

// Builds a formMixin given a configuration
const maker = function maker(config_) {
  // Overiding default config
  const config = Object.assign({}, defaultConfig, config_);

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
      // Adds this. to everything that looks like a variable
      // TODO: find a better way
      $compileExpression(expression) {
        const regExVariable = /^[A-Za-z_][\w_\.]*/;
        const regExSpace = /^\s+'/;
        const regExQuote1 = /^'[^']+'/;
        const regExQuote2 = /^"[^"]+"/;
        let compiled = '';
        const dependencies = [];
        let i = 0;
        while (i < expression.length) {
          const rest = expression.substring(i);
          function eat(regExp, isDependent) {
            const found = rest.match(regExp);
            if (found != null) {
              const foundVal = found[0];
              const prefix = isDependent ? 'this.' : '';
              if (isDependent) {
                dependencies.push(foundVal);
              }
              compiled = `${compiled}${prefix}${foundVal}`;
              i += found.length;
              return true;
            }
            return false;
          }
          if (eat(regExVariable, true)) break;
          if (eat(regExSpace, false)) break;
          if (eat(regExQuote1, false)) break;
          if (eat(regExQuote2, false)) break;
          compiled = `${compiled}${rest[0]}`;
          i += 1;
        }
        return { compiled, dependencies };
      },
      // Computes the validation line of an input
      $getValidationLine(data) {
        const regEx = /(.*)\(([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*)(?:\s?,\s?)?([^,]*).*\)/;
        const match = regEx.exec(data);
        if (match != null) {
          const method = match[1];
          const params = [];
          let dependencies = [];
          const valid = true;
          const error = undefined;
          let customErrorMessage;
          for (let i = 2; i < match.length; i += 1) {
            // Spécial parameter
            if (match[i].includes('=')) {
              const split = match[i].split('=');
              const key = split[0];
              const compiledObject = this.$compileExpression(split[1]);
              const value = compiledObject.compiled;
              dependencies = dependencies.concat(compiledObject.dependencies);
              // Error parameter
              if (key === 'error') customErrorMessage = value;
              // Unknown special parameter
              else console.warn(`Data validation special parameter '${key}' cannot be parsed in '${data}'`);
            // Normal parameter
            } else {
              const compiledObject = this.$compileExpression(match[i]);
              params.push(compiledObject.compiled);
              dependencies = dependencies.concat(compiledObject.dependencies);
            }
          }
          return {
            dependencies, method, params, valid, error, customErrorMessage,
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
        // Setting valid and error values for line
        const valid = this[line.method](...params_);
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
        // Validate each lines
        for (let i = 0; i < lines.length; i += 1) {
          const line = lines[i];
          // eslint-disable-next-line
          const res = this.$validateLine(line);
          if (!res) valid = false;
        }
        return valid;
      },
      // Computes the validation status of an input
      $validateInput(validationInput_) {
        const validationInput = validationInput_;
        const valid = this.$validateLines(validationInput.lines);
        let error;
        // Sets up class on input element
        if (valid === true) {
          validationInput.input.classList.remove(config.classError);
          validationInput.input.classList.add(config.classSuccess);
        } else {
          validationInput.input.classList.remove(config.classSuccess);
          validationInput.input.classList.add(config.classError);
          if (!valid) {
          // Sets Override error message if available
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
          if (reference === undefined &&
            lines.length > 0 &&
            lines[0].dependencies.length > 0) [reference] = lines[0].dependencies;
          validationInput = {
            reference, input, lines, customErrorMessage,
          };
          // Initial validation
          this.$validateInput(validationInput);
          // Bind Validation for each dependency found for this input
          for (let i = 0; i < lines.length; i += 1) {
            const line = lines[i];
            for (let j = 0; j < line.dependencies.length; j += 1) {
              this.$watch(line.dependencies[j], () => {
                this.$validateInput(validationInput);
                this.validationInputs = Object.assign({}, this.validationInputs);
              });
            }
          }
        }
        return validationInput;
      },
      getValidationError(reference) {
        const input = this.validationStatus.inputs[reference];
        return input !== undefined ? input.error : '';
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
        return this.validateMinChars(text, [1]);
      },
      validateGreaterThan(number, target) {
        return number !== undefined && number > target;
      },
      validatePositive(number) {
        return this.validateGreaterThan(number, [0]);
      },
      validateMultipleOf(number, mod) {
        return number % mod === 0;
      },
      validateEqual(text, otherText) {
        return text === otherText;
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
          const keys = Object.keys(validation.inputs);
          for (let i = 0; i < keys.length; i += 1) {
            if (!validation.inputs[keys[i]].valid) {
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
