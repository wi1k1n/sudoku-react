import React from 'react';
import ReactDOM from 'react-dom';
import KeyHandler, { KEYPRESS, KEYDOWN } from 'react-key-handler';

import './index.css';


class Square extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const bCN = this.props.bordersClassName;
        const cnt_clName = 'square-container' + (bCN ? (' ' + bCN) : '');
        const sq_clName = 'square' + (this.props.focused ? ' square-focus' : '');
        return (
            <div
                className={cnt_clName}
            >
                <button
                    className={sq_clName}
                    onClick={this.props.onClick}
                >
                    {this.props.value}
                </button>
            </div>
        );
    }
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // squares: Array.from(Array(81).keys()).sort((a, b) => Math.random() - 0.5)
            squares: Array(81).fill(null),
            focused: null,
        };

        this.indices = this.computeIndices();

        this.randomize = this.randomize.bind(this);
        this.onArrowKey = this.onArrowKey.bind(this);
        this.onDigitKey = this.onDigitKey.bind(this);
    }

    handleClick(r, c) {
        this.setState({focused: [r, c]});
    }
    
    onArrowKey(evt) {
        if (!this.state.focused) {
            this.setState({focused: [0, 0]});
            return;
        }

        let f = this.state.focused;
        switch (evt.key) {
            case 'ArrowUp': f[0] -= 1; break;
            case 'ArrowDown': f[0] += 1; break;
            case 'ArrowLeft': f[1] -= 1; break;
            case 'ArrowRight': f[1] += 1; break;
            default: break;
        }

        if (f[0] < 0) f[0] += 9;
        if (f[0] > 8) f[0] -= 9;
        if (f[1] < 0) f[1] += 9;
        if (f[1] > 8) f[1] -= 9;

        this.setState({focused: f});
    }
    onDigitKey(evt) {
        if (!this.state.focused) return;
        
        const f = this.state.focused;
        const sq = this.state.squares.slice();

        if (evt.key == 'Delete') {
            sq[f[0] * 9 + f[1]] = '';
        } else {
            sq[f[0] * 9 + f[1]] = parseInt(evt.key[0]);
        }
        this.setState({squares: sq});
    }

    computeIndices() {
        let rows = [];
        let cols = [];
        let blocks = [];
        for (let i = 0; i < 9; i++) {
            // rows
            rows.push(Array.from(Array(9).keys()).map(v => v + i * 9));
            // cols
            cols.push(Array.from(Array(9).keys()).map(v => v * 9 + i));
            // blocks
            let block = [];
            for (let j = 0; j < 3; j++) {
                // let tr = Math.floor(i / 3) * 3;
                // let tc = (i % 3) * 3;
                // let start = (tr + j) * 9 + tc;
                let start = (Math.floor(i / 3) * 3 + j) * 9 + (i % 3) * 3;
                block = block.concat(Array.from(Array(3).keys()).map(v => start + v));
            }
            blocks.push(block);
        }
        return {
            rows: rows,
            cols: cols,
            blocks: blocks,
        };
    }
    randomize(evt) {
        let rndArr = Array.from(Array(81).keys()).sort((a, b) => Math.random() - 0.5);
        // this.setState({squares: rndArr});
        let newArr = Array(81).fill(null);
        // for (let i = 0; i < rndArr.length; i++) {
        //     let r = Math.floor(i / 9);
        //     let c = i % 9;
        //     let sr = Math.floor(r / 3);
        //     let sc = (Math.floor(c / 3) % 3);
        //     let rndArrSm = Array.from(Array(9).keys()).sort((a, b) => Math.random() - 0.5);
        //     for (let j = 0; j < rndArrSm.length; j++) {
        //         let v = rndArrSm[j];
        //         if (!this.isInRow(r, v, newArr) && !this.isInCol(c, v, newArr) && !this.isInBlock(sr, sc, v, newArr)) {
        //             newArr[i] = v;
        //             break;
        //         }
        //     }
        //     // this.logSudoku(newArr);
        // }
        this.fillSudoku(newArr);
        this.setState({squares: newArr});
    }
    fillSudoku(arr) {
        // find next empty cell
        let idx = arr.findIndex(v => v === null);
        // no empty cells found => sudoku filled
        if (idx === -1) return true;
        
        // trying to fill with one of 0..8
        let numbers = Array.from(Array(9).keys()).sort((a, b) => Math.random() - 0.5);
        for (let j = 0; j < numbers.length; j++) {
            const v = numbers[j];
            // skip invalid numbers
            if (!this.isValid(idx, v, arr)) continue;
            
            // try first valid number
            arr[idx] = v;
            // go down into recursion
            if (this.fillSudoku(arr)) {
                // if success, return success back through recursion
                return true;
            }
            // if failed, return current value back to null
            arr[idx] = null;
        }
        return false;
    }
    logSudoku(arr) {
        const zeroPad = (num, places) => String(num).padStart(places, ' ')
        let s = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                s += zeroPad(arr[i * 9 + j], 5);
            }
            s += '\n';
        }
        console.log(s);
    }

    isValid(idx, v, ar) {
        let arr = ar ? ar : this.state.squares;
        // row, col, blockrow, blockcol
        let r = Math.floor(idx / 9);
        let c = idx % 9;
        // let br = Math.floor(r / 3);
        // let bc = (Math.floor(c / 3) % 3);
        // return !(this.isInRow(r, v, arr) || this.isInCol(c, v, arr) || this.isInBlock(br, bc, v, arr));
        return !(this.isInRow(r, v, arr) || this.isInCol(c, v, arr) || this.isInBlock(Math.floor(r / 3), (Math.floor(c / 3) % 3), v, arr));
    }
    isInRow(r, v, ar) {
        let arr = ar ? ar : this.state.squares;
        return this.indices.rows[r].map(ind => arr[ind]).includes(v);
    }
    isInCol(c, v, ar) {
        let arr = ar ? ar : this.state.squares;
        return this.indices.cols[c].map(ind => arr[ind]).includes(v);
    }
    isInBlock(sr, sc, v, ar) {
        let arr = ar ? ar : this.state.squares;
        return this.indices.blocks[sr * 3 + sc].map(ind => arr[ind]).includes(v);
    }

    renderSquare(r, c, b) {
        let bCN = ''; // borderClassName
        for (const l of b) {
            bCN += ' square-border-' + l;
        }
        const focused = (this.state.focused && this.state.focused[0] == r && this.state.focused[1] == c ? 1 : 0);
        return (
            <Square
                row={r}
                col={c}
                value={this.state.squares[r * 9 + c]}
                bordersClassName={bCN}
                focused={focused}
                key={'s'+(r*9+c)}
                onClick={() => this.handleClick(r, c)}
            />
        );
    }

    render() {
        const status = 'Next player: X';
        const rows = [];
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                let borders = '';
                if (!(j % 3)) borders += 'l';
                if (!(i % 3)) borders += 't';
                if (j % 9 == 8) borders += 'r';
                if (i % 9 == 8) borders += 'b';

                row.push(this.renderSquare(i, j, borders));
            }
            const k = 'k' + i;
            rows.push(<div className="square-row" key={k}>{row}</div>);
        }

        return (
            <div>
                <KeyHandler
                    keyEventName={KEYDOWN}
                    keyValue={['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']}
                    onKeyHandle={this.onArrowKey}
                />
                <KeyHandler
                    keyEventName={KEYPRESS}
                    keyValue={['1','2','3','4','5','6','7','8','9','Delete']}
                    onKeyHandle={this.onDigitKey}
                />
                <KeyHandler
                    keyEventName={KEYDOWN}
                    keyValue={'Delete'}
                    onKeyHandle={this.onDigitKey}
                />
                <div className="status">
                    <button
                        className="control-btn"
                        onClick={this.randomize}
                    >
                        Randomize
                    </button>
                </div>
                {rows}
            </div>
        );
    }
}

class Game extends React.Component {
    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div>Status:</div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);



// =========================================
// =========================================