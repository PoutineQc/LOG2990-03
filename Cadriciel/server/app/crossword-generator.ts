import { Utilities } from './utilities';
import { Lexicon } from './lexicon';
import { CrosswordVerifier } from './crossword-verifier';
import { Word } from '../../commun/word';

import { LEXICON_PATH, BLANK_SQUARE, BLACK_SQUARE } from './config';
import { Level } from '../../client/src/app/crossword-game/configuration/level';

export class CrosswordGenerator {
    public grid: string[][];
    public words: Set<string>;
    public wordsWithIndex: Array<Word>;

    private size: number;
    private previousGridState: string[][];
    private gridCounter: number[][];
    private previousGridCounter: number[][];
    private lexicon: Lexicon;
    private previousWords: Set<string>;

    constructor(size: number) {
        this.size = size;
        this.reset();
        this.saveState();
        this.loadLexicon(LEXICON_PATH);
    }

    public newCrossword(difficulty: string): string[][] {
        this.reset();
        return this.generateCrossword(difficulty);
    }

    public mutate(difficulty: string, words: Array<Word>): string[][] {
        this.reset();
        this.setGrid(words);
        return this.generateCrossword(difficulty);
    }

    public patternForLine(i: number, horizontal: boolean): string {
        if (horizontal) {
            return this.grid[i].join('');
        } else {
            let pattern = '';
            for (let index = 0; index < this.size; index++) {
                pattern += this.grid[index][i];
            }
            return pattern;
        }
    }

    private reset(): void {
        this.words = new Set<string>();
        this.wordsWithIndex = new Array<Word>();
        this.grid = this.newGrid(this.size, BLANK_SQUARE);
        this.gridCounter = this.newGrid(this.size, 0);
    }

    private newGrid(size: number, fill: any): Array<any> {
        return new Array(size).fill(null).map(res => {
            return new Array(size).fill(null).map(u => {
                return fill;
            });
        });
    }

    private loadLexicon(file: string): void {
        this.lexicon = new Lexicon(LEXICON_PATH);
    }

    private addLetter(i: number, j: number, letter: string): boolean {
        if (letter.length !== 1
            || CrosswordVerifier.indexesOutOfBounds(i, j, this.size)) {
            return false;
        }
        if (this.grid[i][j] !== BLANK_SQUARE && this.grid[i][j] !== letter) {
            return false;
        }
        this.grid[i][j] = letter;
        this.gridCounter[i][j]++;
        return true;
    }

    private addWord(i: number, j: number, word: string, horizontal: boolean): boolean {
        const wordToAdd: Word = new Word(i, j, word, horizontal);
        if (this.words.has(word)) {
            return false;
        }

        this.saveState();
        if (!this.addBlackSquares(i, j, word, horizontal)) {
            this.rollback();
            return false;
        }
        for (const letter of word) {
            if (!this.addLetter(i, j, letter)) {
                this.rollback();
                return false;
            } else {
                i = horizontal ? i : i + 1;
                j = horizontal ? j + 1 : j;
            }
        }
        this.words.add(word);
        if (CrosswordVerifier.verify(this) === false) {
            this.rollback();
            return false;
        }
        this.wordsWithIndex.push(wordToAdd);
        return true;
    }

    private addBlackSquares(i: number, j: number, word: string, horizontal: boolean): boolean {
        if (horizontal) {
            if (j > 0) {
                if (!this.addLetter(i, j - 1, BLACK_SQUARE)) {
                    return false;
                }
            }
            if (j + word.length < this.size) {
                if (!this.addLetter(i, j + word.length, BLACK_SQUARE)) {
                    return false;
                }
            }
        } else {
            if (i > 0) {
                if (!this.addLetter(i - 1, j, BLACK_SQUARE)) {
                    return false;
                }
            }
            if (i + word.length < this.size) {
                if (!this.addLetter(i + word.length, j, BLACK_SQUARE)) {
                    return false;
                }
            }
        }
        return true;
    }

    private scoreWord(word: string, pattern: string): number {
        let score = 0;
        for (let i = 0; i < word.length; i++) {
            score = word[i] === pattern[i] ? score + 1 : score;
        }
        return score;
    }

    private bestInsertIndex(word: string, pattern: string): number {
        let insertIndex = 0;
        let maxScore = 0;
        for (let index = 0; index < pattern.length - word.length + 1; index++) {
            const score = this.scoreWord(word, pattern.substr(index, word.length));
            if (score > maxScore) {
                insertIndex = index;
                maxScore = score;
            }
        }
        return insertIndex;
    }

    private addRandomWord(i: number, horizontal: boolean, difficulty: string): boolean {
        const pattern = this.patternForLine(i, horizontal);

        let wordsForPattern: string[];
        switch (difficulty) {
            case (Level.EASY):
                wordsForPattern = this.lexicon.wordsForPattern(pattern, true);
                break;
            case (Level.NORMAL):
                wordsForPattern = this.lexicon.allWordsForPattern(pattern);
                break;
            case (Level.HARD):
                wordsForPattern = this.lexicon.wordsForPattern(pattern, false);
        }

        if (wordsForPattern.length > 0) {
            const randomWord = this.lexicon.randomWordFromArray(wordsForPattern);
            const insertIndex = this.bestInsertIndex(randomWord, pattern);
            if (horizontal) {
                return this.addWord(i, insertIndex, randomWord, true);
            } else {
                return this.addWord(insertIndex, i, randomWord, false);
            }
        } else {
            return false;
        }
    }

    private generateCrossword(difficulty: string): string[][] {
        let foundWord = true;
        while (foundWord) {
            foundWord = false;
            for (let i = 0; i < this.size; i++) {
                foundWord = foundWord
                    || this.addRandomWord(i, true, difficulty)
                    || this.addRandomWord(this.size - i - 1, false, difficulty);
            }
        }

        return this.grid;
    }

    private saveState(): boolean {
        this.previousGridState = Utilities.deepCopy(this.grid);
        this.previousGridCounter = Utilities.deepCopy(this.gridCounter);
        this.previousWords = new Set(Array.from(this.words));
        return true;
    }

    private rollback(): boolean {
        this.grid = Utilities.deepCopy(this.previousGridState);
        this.gridCounter = Utilities.deepCopy(this.previousGridCounter);
        this.words = new Set(Array.from(this.previousWords));
        return true;
    }

    private setGrid(words: Array<Word>): void {
        words.map((word) => {
            return this.addWord(word.i, word.j, word.word, word.horizontal);
        });
    }
}
