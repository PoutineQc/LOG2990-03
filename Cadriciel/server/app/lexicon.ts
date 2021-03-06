import * as fs from 'fs';
import { MIN_WORD_LENGTH } from './config';

const COMMON_WORDS = 'common';
const UNCOMMON_WORDS = 'uncommon';

export class Lexicon {
    private lexiconByLength: any;

    constructor(file: string) {
        this.parseLexiconByLength(file);
    }

    public wordsForPattern(pattern: string, common: boolean): string[] {
        const isBlankPattern: boolean = pattern.trim().length === 0;
        if (isBlankPattern) {
            return this.wordsOfLengthUpTo(pattern.length, common);
        } else {
            return this.wordsForNonEmptyPattern(pattern, common);
        }
    }

    public allWordsForPattern(pattern: string): string[] {
        return this.wordsForPattern(pattern, true)
            .concat(this.wordsForPattern(pattern, false));
    }

    public randomWordFromArray(words: string[]): string {
        return words[Math.floor(Math.random() * words.length)];
    }

    private parseLexiconByLength(file: string): void {
        this.lexiconByLength = JSON.parse(fs.readFileSync(file, 'utf8'));
    }

    private patternToRegex(pattern: string): RegExp {
        const regex = /\s/g;
        const toMatch = pattern.replace(regex, '[a-z]');
        return new RegExp(toMatch, 'g');
    }

    private words(common: boolean): any {
        return this.lexiconByLength[common ? COMMON_WORDS : UNCOMMON_WORDS];
    }

    private wordsOfLength(length: number, common: boolean): Array<string> {
        return this.words(common)[length.toString()];
    }

    private wordsOfLengthUpTo(length: number, common: boolean): Array<string> {
        return new Array(length - MIN_WORD_LENGTH - 1).fill(null)
            .map((value, index) => {
                return this.wordsOfLength(index + MIN_WORD_LENGTH, common);
            }).reduce((previous, current) => {
                return previous.concat(current);
            });
    }

    private wordsMatching(pattern: string, common: boolean): Array<string> {
        const patternRegex = this.patternToRegex(pattern);
        return this.wordsOfLength(pattern.length, common)
            .filter(word => patternRegex.test(word));
    }

    private subpatterns(pattern: string): string[] {
        const results: Set<string> = new Set<string>();
        for (let length = MIN_WORD_LENGTH; length <= pattern.length; length++) {
            for (let index = 0; index <= pattern.length - length; index++) {
                results.add(pattern.substr(index, length));
            }
        }
        return Array.from(results);
    }

    private wordsForNonEmptyPattern(pattern: string, common: boolean): string[] {
        if (pattern.trim().length === 0) {
            return new Array<string>();
        }

        const subpatterns: string[] = this.subpatterns(pattern);
        const nonEmptySubpatterns = subpatterns.filter(subpattern => {
            const isNotEmpty: boolean = subpattern.trim().length > 0;
            return isNotEmpty;
        });
        const wordsForPattern = nonEmptySubpatterns.map(subpattern => {
            return this.wordsMatching(subpattern, common);
        }).reduce((previous, current) => {
            return previous.concat(current);
        });

        return Array.from(new Set(wordsForPattern));
    }
}
