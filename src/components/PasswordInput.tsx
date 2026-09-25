import { InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

/** A password field with a show/hide toggle, so the user can check what they typed. */
export default function PasswordInput({ className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative flex w-full items-center">
      <input {...props} type={shown ? 'text' : 'password'} className={clsx(className, 'pr-9')} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        aria-pressed={shown}
        title={shown ? 'Hide password' : 'Show password'}
        className="absolute right-2 p-1 text-slate-500 hover:text-slate-200 focus:outline-none focus-visible:text-slate-200"
      >
        {shown ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
