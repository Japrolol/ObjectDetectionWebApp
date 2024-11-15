import { useEffect } from 'react';

const MatrixBackground = () => {
    useEffect(() => {
        const cells = document.querySelectorAll('.matrix-cell');
        const rows = 10;
        const cols = 10;
        const timeouts: number[] = [];

        const animateCells = () => {
            for (let col = 0; col < cols; col++) {
                let row = 0;
                const animateNextRow = () => {
                    const cellIndex = row * cols + col;
                    const delay = Math.random() * 1000; // Random delay between 0 and 1000ms

                    const timeoutId = setTimeout(() => {
                        cells[cellIndex].classList.add('active');
                        const fadeOutTimeout = setTimeout(() => {
                            cells[cellIndex].classList.add('fade-out');
                            const resetTimeout = setTimeout(() => {
                                cells[cellIndex].classList.remove('active', 'fade-out');
                                cells[cellIndex].classList.add('reset-color');
                                const removeResetTimeout = setTimeout(() => {
                                    cells[cellIndex].classList.remove('reset-color');
                                    row++;
                                    if (row < rows) {
                                        animateNextRow();
                                    } else if (col === cols - 1 && row === rows) {
                                        setTimeout(animateCells, 5000); // Restart the animation after a delay
                                    }
                                }, 200); // Duration for reset-color
                                timeouts.push(removeResetTimeout);
                            }, 200); // Duration for fade-out
                            timeouts.push(resetTimeout);
                        }, 200); // Duration for active state
                        timeouts.push(fadeOutTimeout);
                    }, delay);
                    timeouts.push(timeoutId);
                };

                animateNextRow();
                setTimeout(animateNextRow, 500); // Start the next column a bit earlier
            }
        };

        animateCells(); // Initial call to start the animation

        return () => {
            // Clear any timeouts if needed
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <table className={"matrix-bg"}>
            <tbody>
                {Array.from({ length: 10 }, (_, i) => (
                    <tr key={i}>
                        {Array.from({ length: 10 }, (_, j) => (
                            <td key={j} className="matrix-cell" />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default MatrixBackground;