interface ButtonContainerProps {
    handleClick?: () => void;
    handleClear: () => void;
    buttonText: string;
    buttonType: "submit" | "button";
    disabled?: boolean;
}

export default function ButtonContainer({ handleClick, handleClear, buttonText, buttonType, disabled }: ButtonContainerProps) {
    return (
        <div className="flex sm:flex-row flex-col gap-2 justify-between sm:justify-end" aria-label="Buttons container">
            <button className="form-button disabled:opacity-25 disabled:pointer-events-none" type={buttonType} aria-label={buttonText + " button"} onClick={handleClick} disabled={disabled}>{buttonText}</button>
            <button className="form-button-clear" onClick={handleClear} aria-label="Clear button">Clear</button>
        </div>
    );
}