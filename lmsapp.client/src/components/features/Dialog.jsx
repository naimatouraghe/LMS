import * as DialogPrimitive from '@radix-ui/react-dialog';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogContent = ({ className = '', children, ...props }) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
    <DialogPrimitive.Content
      className={`fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);
export const DialogHeader = ({ className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props} />
);
export const DialogTitle = ({ className = '', ...props }) => (
  <DialogPrimitive.Title
    className={`text-lg font-semibold text-gray-900 ${className}`}
    {...props}
  />
);
