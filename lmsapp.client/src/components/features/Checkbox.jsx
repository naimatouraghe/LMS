export const Checkbox = ({ className = '', onChange, checked, ...props }) => {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
      onChange={onChange} // Utiliser onChange au lieu de onCheckedChange
      checked={checked}
      {...props}
    />
  );
};
