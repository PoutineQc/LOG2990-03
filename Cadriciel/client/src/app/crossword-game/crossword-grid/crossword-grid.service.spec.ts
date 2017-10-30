import { TestBed } from '@angular/core/testing';

import { CrosswordGridService } from './crossword-grid.service';
import { CrosswordPointsService } from '../crossword-points/crossword-points.service';

let gridService: CrosswordGridService;

const grid = [
    ['a', 'p', 'p', 'e', 'a', 'l', '#', 'r', 'a', 't'],
    ['#', ' ', ' ', '#', ' ', ' ', ' ', 'i', ' ', 'e'],
    ['s', '#', 'a', 'p', 'p', 'e', 'n', 'd', 'i', 'x'],
    ['t', ' ', ' ', 'r', ' ', ' ', '#', 'e', ' ', 't'],
    ['a', '#', 'w', 'a', 'r', '#', 'p', '#', ' ', 'b'],
    ['f', ' ', ' ', 'c', '#', 'r', 'a', 'd', 'i', 'o'],
    ['f', 'i', 's', 't', '#', ' ', 's', ' ', ' ', 'o'],
    ['#', ' ', ' ', 'i', ' ', ' ', '#', ' ', ' ', 'k'],
    ['f', 'l', 'i', 'c', 'k', '#', ' ', ' ', ' ', '#'],
    [' ', ' ', ' ', 'e', ' ', ' ', ' ', ' ', ' ', ' ']
];

const wordsWithIndex = [
    { 'i': 0, 'j': 0, 'word': 'appeal', 'horizontal': true },
    { 'i': 0, 'j': 9, 'word': 'textbook', 'horizontal': false },
    { 'i': 2, 'j': 2, 'word': 'appendix', 'horizontal': true },
    { 'i': 0, 'j': 7, 'word': 'ride', 'horizontal': false },
    { 'i': 0, 'j': 7, 'word': 'rat', 'horizontal': true },
    { 'i': 5, 'j': 5, 'word': 'radio', 'horizontal': true },
    { 'i': 4, 'j': 6, 'word': 'pas', 'horizontal': false },
    { 'i': 2, 'j': 3, 'word': 'practice', 'horizontal': false },
    { 'i': 4, 'j': 2, 'word': 'war', 'horizontal': true },
    { 'i': 6, 'j': 0, 'word': 'fist', 'horizontal': true },
    { 'i': 8, 'j': 0, 'word': 'flick', 'horizontal': true },
    { 'i': 2, 'j': 0, 'word': 'staff', 'horizontal': false }
];

describe('#CrosswordGridService', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CrosswordPointsService,
                CrosswordGridService
            ]
        });
        gridService = TestBed.get(CrosswordGridService);
    });

    it('should construct', () => {
        expect(gridService).toBeDefined();
    });

    describe('initialize()', () => {
        it('should initialize the grid of CrosswordSquares', () => {
            expect(gridService.grid).toBeUndefined();
            gridService.initialize(grid, wordsWithIndex);
            expect(gridService.grid).toBeDefined();
        });

        it('should initialize the answers of the grid', () => {
            gridService.initialize(grid, wordsWithIndex);
            gridService.grid.map((row, i) => {
                row.map((square, j) => {
                    expect(square.answer).toEqual(grid[i][j]);
                });
            });
        });

        it('should initialize the words contributing to each index', () => {
            gridService.initialize(grid, wordsWithIndex);

            expect(gridService.grid[1][0].words.length).toEqual(0);

            expect(gridService.grid[0][0].words.length).toEqual(1);
            gridService.grid[0][0].words.map((word) => {
                expect(word).toEqual('appeal');
            });

            expect(gridService.grid[0][9].words.length).toEqual(2);
            gridService.grid[0][9].words.map((word) => {
                expect(['rat', 'textbook']).toContain(word);
            });
        });
    });
});
