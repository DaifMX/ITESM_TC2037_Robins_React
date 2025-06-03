// @ts-nocheck
import { useState } from "react";

import Swal from 'sweetalert2'

const directions = ["N", "E", "S", "W"];
const directionVectors = {
    N: [-1, 0],
    E: [0, 1],
    S: [1, 0],
    W: [0, -1],
};

const circleStyles = "w-8 h-8 rounded-full flex items-center justify-center text-white bg-blue-500 shadow-lg";

const GridWithCircle = () => {
    const circleInitialValues = { row: 0, col: 0, dir: 'E' };
    const [circle, setCircle] = useState(circleInitialValues);
    const [instructions, setInstructions] = useState([]);
    const [running, setRunning] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) throw new Error("File not received.");

        const reader = new FileReader();
        reader.onload = (event) => {
            const lines = event.target.result
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);
            setInstructions(lines);
        };
        reader.readAsText(file);
    };

    const handleInstructions = async () => {
        setRunning(true);
        let { row, col, dir } = circle;

        for (let instruction of instructions) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const iVal = parseInt(instruction.split(" ")[1], 10);

            if (instruction.startsWith("mov")) {
                const [dr, dc] = directionVectors[dir];
                for (let i = 0; i < iVal; i++) {
                    row += dr;
                    col += dc;

                    if (row < 0 || row > 7 || col < 0 || col > 7) {
                        return Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Out of bound.',
                            heightAuto: false,
                            background: '#1e1e1e',
                            color: '#f1f1f1',
                            confirmButtonColor: '#3085d6',
                            showCancelButton: false,
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        }).then((result) => {
                            if (result.isConfirmed) handleReset();
                        });
                    }

                    setCircle({ row, col, dir });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            } else if (instruction.startsWith("rot")) {
                const steps = (iVal / 90) % 4;
                if (!Number.isInteger(steps) || iVal > 360) {
                    return Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Bad rotation value.',
                        heightAuto: false,
                        background: '#1e1e1e',
                        color: '#f1f1f1',
                        confirmButtonColor: '#3085d6',
                        showCancelButton: false,
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then((result) => {
                        if (result.isConfirmed) handleReset();
                    });
                }
                const dirIndex = (directions.indexOf(dir) + steps) % 4;
                dir = directions[dirIndex];
                setCircle({ row, col, dir });
            }
        }

        setRunning(false);
    };

    const handleReset = () => {
        setRunning(false);
        setInstructions([]);
        setCircle(circleInitialValues);
    };

    const setCircleDir = (dir) => {
        switch (dir) {
            case "N":
                return "↑";
            case "E":
                return "→";
            case "S":
                return "↓";
            case "W":
                return "←";
            default:
                return "";
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 flex flex-col items-center justify-center px-4 py-10">
            <h1 className="text-white text-2xl font-sans">Robins</h1>
            <div className="grid grid-cols-8 max-w-full bg-gray-300 rounded-lg overflow-hidden shadow-md">
                {[...Array(8)].map((_, row) =>
                    [...Array(8)].map((_, col) => {
                        const isCircle = row === circle.row && col === circle.col;
                        return (
                            <div
                                key={`${row}-${col}`}
                                className="w-10 h-10 bg-white border border-gray-300 flex items-center justify-center"
                            >
                                {isCircle ? (
                                    <div
                                        className={
                                            running
                                                ? `${circleStyles} bg-green-500`
                                                : `${circleStyles} ${instructions.length === 0
                                                    ? "bg-red-500 animate-pulse"
                                                    : "bg-blue-500 animate-pulse"
                                                }`
                                        }
                                    >
                                        {setCircleDir(circle.dir)}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 bg-gray-100 backdrop-blur-md p-4 w-80 rounded-xl">
                <div className="relative">
                    {instructions.length > 0 ?
                        <>
                            <button
                                id='reset-btn'
                                className={`
                                    inline-flex items-center justify-center
                                    px-4 py-2 
                                    rounded-lg text-white font-sans
                                    transition 
                                    ${running
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700"}
                                `}
                                disabled={running}
                                onClick={handleReset}
                            >
                                Reset
                            </button>
                        </>
                        : <>
                            <input
                                id="file-upload"
                                type="file"
                                accept=".txt"
                                onChange={handleFileUpload}
                                disabled={running}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className={`
                                inline-flex items-center justify-center
                                cursor-pointer 
                                px-4 py-2 
                                rounded-lg text-white font-sans
                                transition 
                                ${"bg-blue-600 hover:bg-blue-700"}
                            `}
                            >
                                Upload Instructions
                            </label>
                        </>
                    }

                </div>

                <button
                    onClick={handleInstructions}
                    disabled={running || instructions.length === 0}
                    className={`
                        inline-flex items-center justify-center
                        px-4 py-2 
                        rounded-lg text-white 
                        transition 
                        ${running || instructions.length === 0
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"}
                    `}
                >
                    {running ? "Running..." : "Run"}
                </button>
            </div>
        </div>
    );
};

export default GridWithCircle;
