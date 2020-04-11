export default class BlockInfo {
    type: string;
    name: string;
    definition: string;

    constructor(public startIndex: number, public endIndex: number) {
        this.type = '';
        this.name = '';
        this.definition = '';
    }

    setPath(path: string) {
        this.name = `${path}.${this.name}`;
    }

    toPlainObject () {
        return {
            name: this.name,
            type: this.type,
            definition: this.definition
        };
    }
}
