const fs=require('fs')
const path=require('path')
const parser=require('@babel/parser')
const traverse=require('@babel/traverse').default
const babel=require('@babel/core')

let root=process.cwd()
function readModuleInfo(filePath){
    filePath='./'+path.relative(root,path.resolve(filePath)).replace(/\\+/g,'/')
    const content=fs.readFileSync(filePath,'utf-8')
    const ast=parser.parse(content)
    const deps=[]
    traverse(ast,{
        CallExpression:({node})=>{
            if(node.callee.name==='require'){
                node.callee.name='_require_'
                let moduleName=node.arguments[0].value
                moduleName+=path.extname(moduleName)?'':'.js'
                moduleName+=path.join(path.dirname(filePath),moduleName)
                moduleName='./'+path.relative(root,moduleName).replace(/\\+/g,'/')
                deps.push(moduleName)
                node.arguments[0].value=moduleName
            }
        }
    })
    const {code}=babel.transformFromAstSync(ast)
    return {
        filePath,
        deps,
        code
    }
}

function buildDependencyGraph(entry){
    const entryInfo=readModuleInfo(entry)

    const graphArr=[]
    graphArr.push(entryInfo)

    for(const module of graphArr){
        module.deps.forEach((depPath)=>{
            const moduleInfo=readModuleInfo(path.resolve(depPath))
            graphArr.push(moduleInfo)
        })
    }
    return graphArr
}

function pack(graph, entry) {
    const moduleArr = graph.map((module) => {
      return (
        `"${module.filePath}": function(module, exports, _require_) {
          eval(\`` +
        module.code +
        `\`)
        }`
      )
    })
    const output = `;(() => {
      var modules = {
        ${moduleArr.join(',\n')}
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
  
      _require_('${entry}')
    })()`
    return output
  }


  function main(entry='./src/index.js',output='./dist.js'){
      fs.writeFileSync(output,pack(buildDependencyGraph(entry),entry))

  }

  main()
