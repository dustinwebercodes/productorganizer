export default function Form() {
  return (
    <form className="space-y-4 w-full max-w-md mx-auto px-4 sm:px-0">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Input Label
        </label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <button
        type="submit"
        className="w-full sm:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        Submit
      </button>
    </form>
  )
} 