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

    randomize(evt) {
        this.setState({squares: Array.from(Array(81).keys()).sort((a, b) => Math.random() - 0.5)});
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