import Module from './module.class.js';

export default class Modules {
    constructor() {
        this.data = [];
    }

    populate(modules) {
        this.data = modules.map(module => new Module(module.code, module.cliteral, module.vliteral, module.courseId));
    }

    toString() {
        return this.data.map(module => `Code: ${module.code}, CLiteral: ${module.cliteral}, VLiteral: ${module.vliteral}, Course ID: ${module.courseId}`).join('\n');
    }

    getModuleByCode(moduleCode) {
    const module = this.data.find(module => module.code === moduleCode);
    
    if (module === undefined) {
        throw new Error(`No existe el módulo con código ${moduleCode}`)
    }

    return module;
}
  
}