'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Delete, History } from 'lucide-react';

export default function Calculator() {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [memory, setMemory] = useState(0);
    const [tape, setTape] = useState<string[]>([]);
    const [isScientific, setIsScientific] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    // Listen for command to open calculator
    useEffect(() => {
        const handleCalcCommand = () => {
            setIsOpen(prev => !prev);
        };

        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                return;
            }

            if (!isOpen) return;

            // Prevent default behavior for calculator keys to avoid scrolling etc.
            if (['+', '-', '*', '/', 'Enter', 'Escape', 'Backspace'].includes(e.key)) {
                e.preventDefault();
            }

            // Numbers
            if (/^[0-9]$/.test(e.key)) {
                inputDigit(e.key);
            }
            else if (e.key === '.') {
                inputDecimal();
            }
            // Operators
            else if (e.key === '+') performOperation('+');
            else if (e.key === '-') performOperation('-');
            else if (e.key === '*') performOperation('×');
            else if (e.key === '/') performOperation('÷');
            else if (e.key === '%') performScientificOperation('%');
            // Enter / Equals
            else if (e.key === 'Enter' || e.key === '=') {
                handleEquals();
            }
            // Clear / Backspace
            else if (e.key === 'Backspace') {
                // Simple backspace implementation: clear entry if not waiting for operand
                if (!waitingForOperand && display.length > 1) {
                    setDisplay(display.slice(0, -1));
                } else {
                    setDisplay('0');
                }
            }
            else if (e.key === 'Escape') {
                clear();
            }
        };

        window.addEventListener('openCalculator' as any, handleCalcCommand);
        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('openCalculator' as any, handleCalcCommand);
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isOpen, display, waitingForOperand, operation, previousValue]); // Add dependencies for closure capture

    const addToTape = (expression: string) => {
        setTape(prev => [expression, ...prev.slice(0, 19)]);
    };

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0.');
            setWaitingForOperand(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const clear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForOperand(false);
    };

    const clearEntry = () => {
        setDisplay('0');
    };

    const performOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operation) {
            const currentValue = previousValue || 0;
            const newValue = calculate(currentValue, inputValue, operation);

            addToTape(`${currentValue} ${operation} ${inputValue} = ${newValue}`);
            setDisplay(String(newValue));
            setPreviousValue(newValue);
        }

        setWaitingForOperand(true);
        setOperation(nextOperation);
    };

    const calculate = (firstValue: number, secondValue: number, op: string): number => {
        switch (op) {
            case '+': return firstValue + secondValue;
            case '-': return firstValue - secondValue;
            case '×': return firstValue * secondValue;
            case '÷': return firstValue / secondValue;
            case '^': return Math.pow(firstValue, secondValue);
            default: return secondValue;
        }
    };

    const performScientificOperation = (func: string) => {
        const value = parseFloat(display);
        let result: number;

        // Special handling for percentage in operations
        if (func === '%') {
            if (previousValue !== null && operation) {
                // Calculate percentage of previous value
                // e.g., 100 - 18% means 100 - (100 * 0.18) = 82
                const percentValue = (previousValue * value) / 100;

                // User requested immediate calculation (e.g. 100-10% -> 90)
                result = calculate(previousValue, percentValue, operation);

                addToTape(`${previousValue} ${operation} ${percentValue} (${value}%) = ${result}`);
                setDisplay(String(result));

                // Reset state as if equals was pressed
                setPreviousValue(null);
                setOperation(null);
                setWaitingForOperand(true);
                return;
            } else {
                // Just convert to decimal
                result = value / 100;
                addToTape(`${value}% = ${result}`);
                setDisplay(String(result));
                setWaitingForOperand(true);
                return;
            }
        }

        switch (func) {
            case 'sin': result = Math.sin(value * Math.PI / 180); break;
            case 'cos': result = Math.cos(value * Math.PI / 180); break;
            case 'tan': result = Math.tan(value * Math.PI / 180); break;
            case 'log': result = Math.log10(value); break;
            case 'ln': result = Math.log(value); break;
            case 'sqrt': result = Math.sqrt(value); break;
            case '1/x': result = 1 / value; break;
            case 'x²': result = value * value; break;
            case 'x³': result = value * value * value; break;
            case '±': result = -value; break;
            case 'e': result = Math.E; break;
            case 'π': result = Math.PI; break;
            default: result = value;
        }

        addToTape(`${func}(${value}) = ${result}`);
        setDisplay(String(result));
        setWaitingForOperand(true);
    };

    const handleEquals = () => {
        const inputValue = parseFloat(display);

        if (previousValue !== null && operation) {
            const result = calculate(previousValue, inputValue, operation);
            addToTape(`${previousValue} ${operation} ${inputValue} = ${result}`);
            setDisplay(String(result));
            setPreviousValue(null);
            setOperation(null);
            setWaitingForOperand(true);
        }
    };

    interface ButtonProps {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
        variant?: 'default' | 'operator' | 'equals' | 'function' | 'clear';
    }

    const Button = ({ children, onClick, className = '', variant = 'default' }: ButtonProps) => {
        const baseClass = 'h-12 rounded-lg font-semibold transition-all active:scale-95';
        const variants = {
            default: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
            operator: 'bg-blue-500 hover:bg-blue-600 text-white',
            equals: 'bg-lekhya-accent hover:bg-orange-600 text-white',
            function: 'bg-lekhya-primary hover:bg-blue-800 text-white text-sm',
            clear: 'bg-red-500 hover:bg-red-600 text-white'
        };

        return (
            <button
                onClick={onClick}
                className={`${baseClass} ${variants[variant]} ${className}`}
            >
                {children}
            </button>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-[420px] bg-white rounded-xl shadow-2xl border-2 border-lekhya-primary overflow-hidden">
            {/* Header */}
            <div className="bg-lekhya-primary text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                        <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span className="font-bold">Scientific Calculator</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/20 p-1 rounded transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Display */}
            <div className="bg-gray-900 text-white p-4">
                <div className="text-right text-4xl font-mono mb-2 overflow-x-auto">
                    {display}
                </div>
                {operation && (
                    <div className="text-right text-sm text-gray-400">
                        {previousValue} {operation}
                    </div>
                )}
            </div>

            {/* Buttons */}
            <div className="p-4 bg-gray-50">
                {/* Scientific Functions Row 1 */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                    <Button variant="function" onClick={() => performScientificOperation('sin')}>sin</Button>
                    <Button variant="function" onClick={() => performScientificOperation('cos')}>cos</Button>
                    <Button variant="function" onClick={() => performScientificOperation('tan')}>tan</Button>
                    <Button variant="function" onClick={() => performScientificOperation('log')}>log</Button>
                    <Button variant="function" onClick={() => performScientificOperation('ln')}>ln</Button>
                </div>

                {/* Scientific Functions Row 2 */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                    <Button variant="function" onClick={() => performScientificOperation('sqrt')}>√</Button>
                    <Button variant="function" onClick={() => performScientificOperation('x²')}>x²</Button>
                    <Button variant="function" onClick={() => performScientificOperation('x³')}>x³</Button>
                    <Button variant="function" onClick={() => performOperation('^')}>x^y</Button>
                    <Button variant="function" onClick={() => performScientificOperation('1/x')}>1/x</Button>
                </div>

                {/* Scientific Functions Row 3 */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                    <Button variant="function" onClick={() => performScientificOperation('π')}>π</Button>
                    <Button variant="function" onClick={() => performScientificOperation('e')}>e</Button>
                    <Button variant="function" onClick={() => performScientificOperation('%')}>%</Button>
                    <Button variant="function" onClick={() => performScientificOperation('±')}>±</Button>
                    <Button variant="clear" onClick={clear}>C</Button>
                </div>

                {/* Number Pad */}
                <div className="grid grid-cols-4 gap-2">
                    <Button onClick={() => inputDigit('7')}>7</Button>
                    <Button onClick={() => inputDigit('8')}>8</Button>
                    <Button onClick={() => inputDigit('9')}>9</Button>
                    <Button variant="operator" onClick={() => performOperation('÷')}>÷</Button>

                    <Button onClick={() => inputDigit('4')}>4</Button>
                    <Button onClick={() => inputDigit('5')}>5</Button>
                    <Button onClick={() => inputDigit('6')}>6</Button>
                    <Button variant="operator" onClick={() => performOperation('×')}>×</Button>

                    <Button onClick={() => inputDigit('1')}>1</Button>
                    <Button onClick={() => inputDigit('2')}>2</Button>
                    <Button onClick={() => inputDigit('3')}>3</Button>
                    <Button variant="operator" onClick={() => performOperation('-')}>-</Button>

                    <Button onClick={() => inputDigit('0')} className="col-span-2">0</Button>
                    <Button onClick={inputDecimal}>.</Button>
                    <Button variant="operator" onClick={() => performOperation('+')}>+</Button>

                    <Button variant="equals" onClick={handleEquals} className="col-span-4">=</Button>
                </div>
            </div>

            {/* History Tape */}
            {tape.length > 0 && (
                <div className="border-t border-gray-200 bg-white max-h-32 overflow-y-auto">
                    <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 flex items-center gap-2">
                        <History className="w-3 h-3" />
                        History
                    </div>
                    {tape.map((entry, i) => (
                        <div key={i} className="px-4 py-1 text-xs font-mono text-gray-600 border-b border-gray-100">
                            {entry}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
