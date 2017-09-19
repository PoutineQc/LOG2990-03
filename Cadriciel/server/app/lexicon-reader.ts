import * as fs from 'fs';
import * as request from 'request';

export class LexiconReader {

    readWords(file: string): string[] {
        let content: string[];
        content = fs.readFileSync(file, 'utf8').split('\r\n');
        return content;
     }

    readWordsOfLength(file:string, wordLength: number): string[] {
         let lexicon: string[] = this.readWords(file);
         let wordsOfLength: string[] = [];

         for(let i of lexicon) {
             if(i.length == wordLength)
                wordsOfLength.push(i);
         }

         return wordsOfLength;
     }

     getWordsWithChar(file: string, character: string, position: number) {
         let lexicon: string[] = this.readWords(file);
         let wordsWithChar: string[] = [];

         for(let i of lexicon) {
             if(i.charAt(position) == character) {
                 wordsWithChar.push(i);
             }
         }

         return wordsWithChar;
     }

     getWordsMatchingPattern(file: string, pattern:string) {
         let lexicon: string[] = this.readWords(file);
         let wordsWithChar: string[] = [];
         let wordsPatternLength:string[] = this.readWordsOfLength(file, pattern.length);

         for(let i = 0; i < wordsPatternLength.length; i++){
             let match: boolean = true;
             for(let j = 0; j < pattern.length; j++) {
                 if(wordsPatternLength[i][j] != pattern[j] && pattern[j] != ' '){
                     match = false;
                 }
             }
             if(match){
                 wordsWithChar.push(wordsPatternLength[i]);
             }
         }

         return wordsWithChar;
     }
}




