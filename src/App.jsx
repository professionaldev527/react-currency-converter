import { useState, useEffect } from "react";
import InputBox from "./components/InputBox";
import useCurrencyInfo from "./hooks/useCurrencyInfo";

function App() {
    // Amount is now a string to preserve decimals like "10.00"
    const [amount, setAmount] = useState("1.00");
    const [from, setFrom] = useState("usd");
    const [to, setTo] = useState("inr");
    const [convertedAmount, setConvertedAmount] = useState(0);

    const currencyInfo = useCurrencyInfo(from);
    const options = Object.keys(currencyInfo);

    useEffect(() => {
        if (currencyInfo && currencyInfo[to]) {
            const numericAmount = Number(amount) || 0;
            setConvertedAmount(numericAmount * currencyInfo[to]);
        }
    }, [amount, from, to, currencyInfo]);

    const swap = () => {
        setFrom(to);
        setTo(from);
        // When swapping, we parse and format the amounts to ensure they stay clean
        setAmount(Number(convertedAmount).toFixed(2));
        setConvertedAmount(Number(amount));
    };

    const formatNumber = (num, decimals = 2) => {
        if (isNaN(num) || num === null) return "0.00";
        return Number(num).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });
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

    const fromSymbol = getCurrencySymbol(from);
    const toSymbol = getCurrencySymbol(to);

    // Unit rate specifically for the bottom text display
    const unitRate = currencyInfo && currencyInfo[to] ? currencyInfo[to] : 0;

    return (
        <div className="w-full min-h-screen bg-[#f3f4f6] font-sans">
            <div className="bg-[#0a146e] w-full pt-16 pb-32 px-4 flex flex-col items-center text-white text-center relative">
                <div className="z-10 relative">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-wide">
                        {fromSymbol}
                        {formatNumber(amount || 1)} {from.toUpperCase()} to{" "}
                        {to.toUpperCase()} - Convert Currency
                    </h1>
                    <p className="text-lg text-blue-100 mb-10">
                        Live currency converter
                    </p>
                </div>

                <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1440 320"
                        className="relative block w-full h-[60px] md:h-[120px]"
                        preserveAspectRatio="none"
                    >
                        <path
                            fill="#f3f4f6"
                            fillOpacity="1"
                            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,138.7C672,117,768,107,864,122.7C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        ></path>
                    </svg>
                </div>
            </div>

            <div className="w-full max-w-6xl mx-auto px-4 -mt-24 z-20 relative">
                <div className="bg-white rounded-xl shadow-xl shadow-blue-900/10 p-6 md:p-8">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {/* NEW FLEX LAYOUT: Clears up overlap and adds clean spacing */}
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 relative w-full">
                            <div className="w-full md:w-[46%]">
                                <InputBox
                                    label="From"
                                    amount={amount}
                                    currencyOptions={options}
                                    onCurrencyChange={(currency) =>
                                        setFrom(currency)
                                    }
                                    selectCurrency={from}
                                    onAmountChange={(val) => setAmount(val)}
                                />
                            </div>

                            {/* Swap Button is now a flex item between the boxes */}
                            <div className="flex justify-center w-full md:w-[8%] z-30 my-2 md:my-0">
                                <button
                                    type="button"
                                    onClick={swap}
                                    className="bg-white border border-gray-300 rounded-full p-3 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Swap currencies"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-15L21 7.5m0 0L16.5 12M21 7.5H7.5"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="w-full md:w-[46%]">
                                <InputBox
                                    label="To"
                                    amount={convertedAmount.toFixed(2)} // Forces output to 2 decimals
                                    currencyOptions={options}
                                    onCurrencyChange={(currency) =>
                                        setTo(currency)
                                    }
                                    selectCurrency={to}
                                    amountDisable
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-end">
                            <div>
                                {/* Result locked to 1.00 USD = X.XXXXXX INR */}
                                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                                    <span className="text-2xl font-semibold text-gray-600">
                                        {fromSymbol}1.00 {from.toUpperCase()} =
                                    </span>{" "}
                                    {toSymbol}
                                    {formatNumber(unitRate, 6)}{" "}
                                    <span className="text-2xl font-semibold text-gray-600">
                                        {to.toUpperCase()}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500 mt-2">
                                    Mid-market rate • Live updating
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6 max-w-2xl mx-auto">
                    We use the mid-market rate for our Converter. This is for
                    informational purposes only. You won’t receive this rate
                    when sending money. Login to view send rates.
                </p>
            </div>
        </div>
    );
}

export default App;
