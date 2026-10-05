/**
 * ui-primitives.jsx
 *
 * Versión liviana, propia, de los componentes que normalmente vendrían de
 * shadcn/ui (Card, Button, Input, Badge). Mismo look & feel, mismo "API"
 * (mismos props: variant, size, className, etc.), pero sin la carpeta
 * src/components/ui ni la dependencia de shadcn.
 *
 * Si en algún momento instalás shadcn/ui, podés borrar este archivo y
 * cambiar los imports en los modales de "./ui-primitives" a
 * "@/components/ui/card", "@/components/ui/button", etc. sin tocar el
 * resto del código, porque los nombres y props son los mismos.
 */

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// --- Card ---

export function Card({ className, children, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

// --- Button ---

const buttonVariants = {
  default: "bg-gradient-to-r from-[#D90429] to-[#EF233C] text-white hover:from-[#EF233C] hover:to-[#D90429]",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  ghost: "text-gray-600 hover:bg-gray-100",
};

const buttonSizes = {
  default: "h-11 px-5 text-sm",
  sm: "h-8 px-3 text-sm",
  icon: "h-9 w-9",
};

// Tres puntitos animados para indicar que una acción está en curso
export function LoadingDots({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} role="status" aria-label="Procesando">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

// loading: deshabilita el botón y muestra los puntitos, para que no se repita la acción
export function Button({ className, variant = "default", size = "default", type = "button", loading = false, disabled, children, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className
      )}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

// --- Input ---

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200",
        className
      )}
      {...props}
    />
  );
}

// --- Badge ---

const badgeVariants = {
  default: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-600",
  secondary: "bg-gray-100 text-gray-700",
  outline: "border border-gray-300 text-gray-600",
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}