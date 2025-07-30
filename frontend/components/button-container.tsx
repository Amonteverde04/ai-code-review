interface ButtonContainerProps {
    handleClick?: () => void;
    handleClear: () => void;
    buttonText: string;
}

export default function ButtonContainer({ handleClick, handleClear, buttonText }: ButtonContainerProps) {
    return (
        <div className="flex sm:flex-row flex-col gap-2 justify-between sm:justify-end" aria-label="Buttons container">
            <button className="form-button" type="submit" aria-label={buttonText + " button"} onClick={handleClick}>{buttonText}</button>
            <button className="form-button-clear" onClick={handleClear} aria-label="Clear button">Clear</button>
        </div>
    );
}