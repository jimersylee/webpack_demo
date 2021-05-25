;(() => {
      var modules = {
        "./src/index.js": function(module, exports, _require_) {
          eval(``)
        }
      }
      var modules_cache = {}
      var _require_ = function(moduleId) {
        if (modules_cache[moduleId]) return modules_cache[moduleId].exports
  
        var module = modules_cache[moduleId] = {
          exports: {}
        }
        modules[moduleId](module, module.exports, _require_)
        return module.exports
      }
  
      _require_('./src/index.js')
    })()