import React from "react";

const CardDetails = ({
  balance,
  cardHolder,
  validThru,
  cardNumber,
  onSetDetails,
  isDetailsSet,
}) => {
  return (
    <div className="w-full max-w-[445px] h-[283px] rounded-[20px] bg-gradient-to-r from-[#9a2f12] to-[#fdaa60] p-6 flex flex-col justify-between box-border">
      {/* Balance Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-white text-2xl font-lato font-normal mb-2">
            Balance
          </span>
          <span className="text-white text-[22px] font-inter font-semibold">
            $ {balance}
          </span>
        </div>
        {/* Set Card Details Button in the Same Row as Balance */}
        <button
          className="px-3 py-1.5 bg-transparent border border-white text-white rounded transition-colors duration-200  text-sm"
          onClick={onSetDetails}
          disabled={isDetailsSet}
        >
          {isDetailsSet ? "Card Details Set" : "Set Card Details"}
        </button>
      </div>

      {/* Chip Image */}
      <div className="self-end">
        <img
          src="https://dashboard.codeparrot.ai/api/image/Z58GOjRi7Jes38uz/chip-car.png"
          alt="Chip"
          className="w-[55.87px] h-[48.28px]"
        />
      </div>

      {/* Card Details Section */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <div>
            <div className="text-white/70 text-[16px] font-inter font-semibold mb-1">
              CARD HOLDER
            </div>
            <div className="text-white text-lg font-inter font-medium">
              {cardHolder}
            </div>
          </div>
          <div>
            <div className="text-white/70 text-[16px] font-inter font-semibold mb-1">
              VALID THRU
            </div>
            <div className="text-white text-lg font-inter font-medium">
              {validThru}
            </div>
          </div>
        </div>

        {/* Card Number */}
        <div className="flex justify-between items-center bg-gradient-to-b from-white/10 to-white/05 p-2 rounded-[10px]">
          <span className="text-white text-[18px] font-inter font-semibold">
            {cardNumber}
          </span>
          <img
            src="https://dashboard.codeparrot.ai/api/image/Z58GOjRi7Jes38uz/group-17.png"
            alt="Card Logo"
            className="w-[70px] h-[45px]"
          />
        </div>
      </div>
    </div>
  );
};

export default CardDetails;
