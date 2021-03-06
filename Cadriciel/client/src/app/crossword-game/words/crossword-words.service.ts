import { Injectable } from '@angular/core';

import { Word } from '../../../../../commun/word';

@Injectable()
export class CrosswordWordsService {
    private wordMap: Map<string, Word>;

    constructor() { }

    public newGame(wordsWithIndex: Array<Word>): void {
        this.wordMap = this.constructWordMap(wordsWithIndex);
    }

    public endGame(): void {
        this.wordMap = undefined;
    }

    public getWordWithIndex(word: string): Word {
        return this.wordMap.get(word);
    }

    public hintExists(word: string): boolean {
        return this.wordMap.get(word) !== undefined;
    }

    public numberOfWords(): number {
        return this.wordMap.size;
    }

    private constructWordMap(wordsWithIndex: Array<Word>): Map<string, Word> {
        return wordsWithIndex.reduce((map, obj) => {
            map.set(obj.word, obj);
            return map;
        }, new Map<string, Word>());
    }
}
