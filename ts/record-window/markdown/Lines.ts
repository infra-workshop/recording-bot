export class Lines {
    private readonly lines: string[];
    private current = 0;

    constructor(str: string) {
        this.lines = str.split('\n')
    }

    get(): string {
        return this.lines[this.current]
    }

    getAndNext(): string {
        return this.lines[this.current++]
    }

    hasNext(): boolean {
        return (this.current + 1) < this.lines.length
    }

    has(): boolean {
        return (this.current) < this.lines.length
    }

    setCurrent(current: number) {
        this.current = current
    }

    getCurrent(): number {
        return this.current
    }
}