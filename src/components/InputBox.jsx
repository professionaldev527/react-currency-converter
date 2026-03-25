import React, { useId, useState, useRef, useEffect } from "react";

// --- Native Browser Helpers --- //
const getCurrencyName = (currencyCode) => {
    try {
        return new Intl.DisplayNames(["en"], { type: "currency" }).of(
            currencyCode.toUpperCase(),
        );
    } catch {
        return currencyCode.toUpperCase();
    }
};

const getCurrencySymbol = (currencyCode) => {
    try {
        const parts = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode.toUpperCase(),
        }).formatToParts(0);
        return parts.find((part) => part.type === "currency").value;
    } catch {
        return "";
    }
};

const getCountryCode = (currencyCode) => {
    const code = currencyCode.toUpperCase();
    if (code === "EUR") return "EU";
    if (code === "ANG") return "CW";
    return code.substring(0, 2);
};

function InputBox({
    label,
    amount,
    onAmountChange,
    onCurrencyChange,
    currencyOptions = [],
    selectCurrency = "usd",
    amountDisable = false,
    currencyDisable = false,
}) {
    const amountInputId = useId();
    const symbol = getCurrencySymbol(selectCurrency);
    const selectedFlagUrl = `https://flagsapi.com/${getCountryCode(selectCurrency)}/flat/64.png`;

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle typing (only allow numbers and decimals)
    const handleInputChange = (e) => {
        const val = e.target.value;
        if (val === "" || /^\d*\.?\d*$/.test(val)) {
            if (onAmountChange) onAmountChange(val);
        }
    };

    // Handle clicking away (Formats "10" to "10.00")
    const handleBlur = (e) => {
        if (!amountDisable && onAmountChange) {
            const val = Number(e.target.value);
            if (!isNaN(val) && e.target.value !== "") {
                onAmountChange(val.toFixed(2));
            }
        }
    };

    return (
        // Added dynamic z-index so an open dropdown NEVER gets blocked
        <div
            className={`relative border border-gray-300 rounded-lg p-4 w-full flex items-center bg-white hover:border-gray-500 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all ${isOpen ? "z-50" : "z-10 focus-within:z-20"}`}
        >
            <label
                htmlFor={amountInputId}
                className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600 font-medium"
            >
                {label}
            </label>

            <div className="flex-1 w-full flex items-center overflow-hidden">
                {symbol && (
                    <span className="text-2xl font-semibold text-gray-800 mr-1 select-none">
                        {symbol}
                    </span>
                )}
                <input
                    id={amountInputId}
                    type="text" // Changed to text to support ".00"
                    inputMode="decimal"
                    className="outline-none w-full bg-transparent text-2xl font-semibold text-gray-800 py-1"
                    placeholder="0.00"
                    disabled={amountDisable}
                    value={amount}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                />
            </div>

            <div
                className="relative flex items-center ml-2 pl-4 border-l border-gray-200 w-[55%] min-w-[200px]"
                ref={dropdownRef}
            >
                <button
                    type="button"
                    className="w-full flex items-center justify-between outline-none cursor-pointer bg-transparent text-gray-700 font-medium text-sm md:text-base py-1 hover:text-gray-900 disabled:opacity-50"
                    onClick={() => !currencyDisable && setIsOpen(!isOpen)}
                    disabled={currencyDisable}
                >
                    <div className="flex items-center overflow-hidden">
                        <img
                            src={selectedFlagUrl}
                            alt="flag"
                            className="w-7 h-5 mr-2 object-cover rounded-sm shadow-sm bg-gray-100 flex-shrink-0"
                            onError={(e) => (e.target.style.display = "none")}
                            onLoad={(e) => (e.target.style.display = "block")}
                        />
                        <span className="truncate text-left">
                            {selectCurrency.toUpperCase()} -{" "}
                            {getCurrencyName(selectCurrency)}
                        </span>
                    </div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className={`w-4 h-4 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <ul className="absolute z-50 top-full right-0 mt-2 w-max min-w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-xl py-1">
                        {currencyOptions.map((currency) => {
                            const flagUrl = `https://flagsapi.com/${getCountryCode(currency)}/flat/64.png`;
                            return (
                                <li
                                    key={currency}
                                    className={`flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm md:text-base ${selectCurrency === currency ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700"}`}
                                    onClick={() => {
                                        if (onCurrencyChange)
                                            onCurrencyChange(currency);
                                        setIsOpen(false);
                                    }}
                                >
                                    <img
                                        src={flagUrl}
                                        alt=""
                                        loading="lazy"
                                        className="w-7 h-5 mr-3 object-cover rounded-sm shadow-sm bg-gray-100 flex-shrink-0"
                                        onError={(e) =>
                                            (e.target.style.display = "none")
                                        }
                                        onLoad={(e) =>
                                            (e.target.style.display = "block")
                                        }
                                    />
                                    <span className="truncate whitespace-nowrap">
                                        {currency.toUpperCase()} -{" "}
                                        {getCurrencyName(currency)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default InputBox;
