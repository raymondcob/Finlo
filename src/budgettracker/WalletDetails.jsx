
const WalletDetails = ({ name, balance, onSetDetails, isDetailsSet }) => {
  return (
    <div className="w-full max-w-[460px] min-w-[300px] h-[283px] flex justify-center items-center relative p-[10px] box-border">
      <div className="w-full h-[240px] bg-gradient-to-b from-[#9a2f12] to-[#fdaa60] rounded-xl p-6 flex flex-col justify-between box-border -z-10">
        <div>
          <div className="font-title text-3xl font-inter font-semibold text-[#fcfcfc]/85 mb-2">
            {name}'s Wallet
          </div>
        </div>
        <div>
          <div className="w-full h-[1px] bg-[#B1B1B1] my-4" />
          <div className="text-[30px] font-inter font-semibold text-[#fcfcfc]/85">
            Cash Balance
          </div>
          <div className="text-[28px] font-inter font-semibold text-white">
            $ {balance}
          </div>
        </div>

        {/* Set Wallet Details Button */}
        <div className="flex justify-center">
          <button
            className="px-3 py-1.5 bg-transparent border border-white text-white rounded transition-colors duration-200 hover:bg-white hover:text-black text-sm"
            onClick={onSetDetails}
            disabled={isDetailsSet}
          >
            {isDetailsSet ? "Balance Set" : "Set Initial Balance"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletDetails;