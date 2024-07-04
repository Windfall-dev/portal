export const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute top-4 left-4 bg-gray-200 text-black font-bold py-2 px-6 rounded-full"
  >
    Back
  </button>
);
