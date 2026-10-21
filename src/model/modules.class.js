import Module from './module.class.js';
import { getDBModules } from '../services/modules.api.js';

export default class Modules {
    constructor() {
        this.data = [];
    }

    async populate() {
        const modules = await getDBModules();
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