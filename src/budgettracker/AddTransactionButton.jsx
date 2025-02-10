

const AddTransactionButton = ({ onClick }) => {
  return (
    <button
      className="mt-5 w-[210px] h-[38px] bg-white border outline-gray-500 outline-dotted rounded-xl cursor-pointer flex items-center justify-center px-4 transition-all duration-200 ease-in-out hover:bg-gray-100"
      onClick={onClick}
    >
      <span className="text-[#6a6a6a] text-lg font-semibold font-subheading">+ Add Transaction</span>
    </button>
  );
};

export default AddTransactionButton;