const AddTransactionButton = ({ onClick }) => {
  return (
    <button
      className="mt-5 w-[210px] h-[38px] bg-white border border-finance-blue-200 rounded-xl cursor-pointer flex items-center justify-center px-4 transition-all duration-200 ease-in-out hover:bg-finance-blue-50 shadow-sm"
      onClick={onClick}
    >
      <span className="text-finance-blue-700 text-lg font-semibold font-subheading">+ Add Transaction</span>
    </button>
  )
}

export default AddTransactionButton

