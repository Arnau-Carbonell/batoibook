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
  
}