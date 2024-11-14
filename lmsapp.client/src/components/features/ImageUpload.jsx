export const ImageUpload = ({ value, onChange }) => {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
      {value ? (
        <div className="relative aspect-video">
          <img
            src={value}
            alt="Course thumbnail"
            className="object-cover rounded-md"
          />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="mt-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                // Ici, vous devrez implémenter la logique d'upload
                // et obtenir l'URL de l'image uploadée
                const file = e.target.files[0];
                // Simulé pour l'exemple
                onChange(URL.createObjectURL(file));
              }}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer text-blue-500 hover:text-blue-600"
            >
              Upload an image
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            16:9 aspect ratio recommended
          </p>
        </div>
      )}
    </div>
  );
};
