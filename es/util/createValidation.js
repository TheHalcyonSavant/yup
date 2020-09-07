import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import mapValues from "lodash-es/mapValues";
import ValidationError from '../ValidationError';
import Ref from '../Reference';
export default function createValidation(config) {
  function validate(_ref, cb) {
    var value = _ref.value,
        path = _ref.path,
        label = _ref.label,
        options = _ref.options,
        originalValue = _ref.originalValue,
        sync = _ref.sync,
        rest = _objectWithoutPropertiesLoose(_ref, ["value", "path", "label", "options", "originalValue", "sync"]);

    var name = config.name,
        test = config.test,
        params = config.params,
        message = config.message;
    var parent = options.parent,
        context = options.context;

    function resolve(item) {
      return Ref.isRef(item) ? item.getValue(value, parent, context) : item;
    }

    function createError(overrides) {
      if (overrides === void 0) {
        overrides = {};
      }

      var nextParams = mapValues(_extends({
        value: value,
        originalValue: originalValue,
        label: label,
        path: overrides.path || path
      }, params, overrides.params), resolve);
      var error = new ValidationError(ValidationError.formatError(overrides.message || message, nextParams), value, nextParams.path, overrides.type || name);
      error.params = nextParams;
      return error;
    }

    var ctx = _extends({
      path: path,
      parent: parent,
      type: name,
      createError: createError,
      resolve: resolve,
      options: options
    }, rest);

    if (!sync) {
      try {
        Promise.resolve(test.call(ctx, value)).then(function (validOrError) {
          if (ValidationError.isError(validOrError)) cb(validOrError);else if (!validOrError) cb(createError());else cb(null, validOrError);
        });
      } catch (err) {
        cb(err);
      }

      return;
    }

    var result;

    try {
      var _result;

      result = test.call(ctx, value);

      if (typeof ((_result = result) == null ? void 0 : _result.then) === 'function') {
        throw new Error("Validation test of type: \"" + ctx.type + "\" returned a Promise during a synchronous validate. " + "This test will finish after the validate call has returned");
      }
    } catch (err) {
      cb(err);
      return;
    }

    if (ValidationError.isError(result)) cb(result);else if (!result) cb(createError());else cb(null, result);
  }

  validate.OPTIONS = config;
  return validate;
}