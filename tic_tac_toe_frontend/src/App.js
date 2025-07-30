import React, { useState, useEffect } from "react";
import "./App.css";

/*
Primary:   #1565c0   (deep blue)
Secondary: #fbc02d   (gold)
Accent:    #d32f2f   (red)
*/

// Helper to calculate winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (const [a, b, c] of lines) {
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[b] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
export default function App() {
  // Board state and session history
  const [history, setHistory] = useState(() => {
    // On reload/close, keep game history in session
    const hist = sessionStorage.getItem("ttt_history");
    return hist
      ? JSON.parse(hist)
      : [
          {
            squares: Array(9).fill(null),
            playerNames: ["Player 1", "Player 2"]
          }
        ];
  });
  const [stepNumber, setStepNumber] = useState(history.length - 1);
  const [xIsNext, setXisNext] = useState(true);
  const [playerNames, setPlayerNames] = useState(
    history[0]?.playerNames || ["Player 1", "Player 2"]
  );
  const [editingNames, setEditingNames] = useState(false);

  // Keep history in session storage
  useEffect(() => {
    sessionStorage.setItem(
      "ttt_history",
      JSON.stringify(
        history.map((h, idx) =>
          idx === 0 ? { ...h, playerNames } : h
        )
      )
    );
  }, [history, playerNames]);

  // Reset game (clear board, keep names and history)
  // PUBLIC_INTERFACE
  const handleReset = () => {
    setHistory([
      {
        squares: Array(9).fill(null),
        playerNames: [...playerNames]
      }
    ]);
    setStepNumber(0);
    setXisNext(true);
  };

  // Clear session game history (option)
  // PUBLIC_INTERFACE
  const handleClearHistory = () => {
    setHistory([
      {
        squares: Array(9).fill(null),
        playerNames: [...playerNames]
      }
    ]);
    setStepNumber(0);
    setXisNext(true);
    sessionStorage.removeItem("ttt_history");
  };

  // Square click handler
  // PUBLIC_INTERFACE
  const handleClick = (i) => {
    const slicedHistory = history.slice(0, stepNumber + 1);
    const current = slicedHistory[slicedHistory.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = xIsNext ? "X" : "O";
    setHistory(
      slicedHistory.concat([
        {
          squares,
          playerNames: [...playerNames]
        }
      ])
    );
    setStepNumber(slicedHistory.length);
    setXisNext(!xIsNext);
  };

  // Time travel handler (browse game history)
  // PUBLIC_INTERFACE
  const jumpTo = (step) => {
    setStepNumber(step);
    setXisNext(step % 2 === 0);
  };

  // Name changes handler
  // PUBLIC_INTERFACE
  const handleNameChange = (idx, value) => {
    const newNames = [...playerNames];
    newNames[idx] = value;
    setPlayerNames(newNames);
  };

  // Board rendering for current state
  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);

  // UI helpers
  const getStatus = () => {
    if (winner) {
      return `Winner: ${
        winner === "X" ? playerNames[0] : playerNames[1]
      }`;
    } else if (current.squares.every((sq) => sq)) {
      return "Draw!";
    } else {
      return `Next: ${
        xIsNext ? `${playerNames[0]} (X)` : `${playerNames[1]} (O)`
      }`;
    }
  };

  // Minimal Board square
  function Square({ value, onClick }) {
    return (
      <button className="square" onClick={onClick} aria-label={value ? `cell ${value}` : "empty cell"}>
        {value}
      </button>
    );
  }

  // PUBLIC_INTERFACE
  function Board({ squares, onClick }) {
    return (
      <div className="board">
        {[0, 1, 2].map((row) => (
          <div className="board-row" key={row}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return (
                <Square
                  key={idx}
                  value={squares[idx]}
                  onClick={() => onClick(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function NameInputs({ names, onChange, onCancel, onSave }) {
    return (
      <div className="names-edit">
        <input
          aria-label="Player 1 Name"
          value={names[0]}
          onChange={(e) => onChange(0, e.target.value)}
          className="player-input"
        />
        <input
          aria-label="Player 2 Name"
          value={names[1]}
          onChange={(e) => onChange(1, e.target.value)}
          className="player-input"
        />
        <button className="btn" onClick={onSave}>
          OK
        </button>
        <button className="btn secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function History({ history, onJump, currentStep }) {
    return (
      <div className="history">
        <div className="history-title">Game History</div>
        <ol>
          {history.map((step, move) => {
            let desc =
              move === 0
                ? "Go to game start"
                : `Go to move #${move}`;
            return (
              <li key={move}>
                <button
                  className={
                    move === currentStep
                      ? "btn history-btn current"
                      : "btn history-btn"
                  }
                  onClick={() => onJump(move)}
                >
                  {desc}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  // -- Main layout --
  return (
    <div className="ttt-app">
      <h1 className="app-title">
        <span style={{ color: "var(--color-primary)" }}>Tic</span>{" "}
        <span style={{ color: "var(--color-secondary)" }}>Tac</span>{" "}
        <span style={{ color: "var(--color-accent)" }}>Toe</span>
      </h1>

      <div className="player-info">
        <div>
          {editingNames ? (
            <NameInputs
              names={playerNames}
              onChange={handleNameChange}
              onCancel={() => setEditingNames(false)}
              onSave={() => setEditingNames(false)}
            />
          ) : (
            <div>
              <span>
                <span
                  className="player-label"
                  style={{
                    color: "var(--color-primary)"
                  }}
                >
                  X: {playerNames[0]}
                </span>
                &nbsp;|&nbsp;
                <span
                  className="player-label"
                  style={{
                    color: "var(--color-secondary)"
                  }}
                >
                  O: {playerNames[1]}
                </span>
              </span>
              <button
                className="btn small"
                style={{ marginLeft: 15 }}
                onClick={() => setEditingNames(true)}
                aria-label="Edit player names"
                title="Edit player names"
              >
                ✎ Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="status">{getStatus()}</div>

      <div className="game-body">
        <Board
          squares={current.squares}
          onClick={winner || current.squares.every((sq) => sq) ? () => {} : handleClick}
        />
      </div>

      <div className="controls">
        <button className="btn" onClick={handleReset}>
          Reset Game
        </button>
        <button className="btn secondary" onClick={handleClearHistory}>
          Clear History
        </button>
      </div>

      <History history={history} onJump={jumpTo} currentStep={stepNumber} />

      <footer className="footer">
        <span>
          Minimalistic Tic Tac Toe &middot;{" "}
          <a
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-secondary)", textDecoration: "none" }}
          >
            Built with React
          </a>
        </span>
      </footer>
    </div>
  );
}
