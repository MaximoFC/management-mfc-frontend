import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SPARE_TYPES } from "../constants/spareTypes";
import { useEffect, useMemo } from "react";

const spareSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
  type: z.string().refine(v => SPARE_TYPES.includes(v), {
    message: "Debe seleccionar un tipo válido"
  }),
  brand: z.string().min(1, "La marca es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
  pricing_currency: z.enum(["USD", "ARS"]),
  price: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .refine(v => !isNaN(v), "Debe ingresar un número válido")
    .min(0.01, "El precio debe ser mayor a 0"),
  stock: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .refine(v => !isNaN(v), "Debe ingresar un número válido")
    .min(0, "El stock debe ser mayor o igual a 0"),
  markup_percent: z.number().min(0).max(100).optional()
});

const replenishSchema = z.object({
  stock: z
    .number({ invalid_type_error: "Debe ingresar un número" })
    .min(1, "Debe ingresar al menos una unidad"),
  price: z
    .number({ invalid_type_error: "Debe ingresar el costo unitario" })
    .min(1, "Debe ingresar el costo unitario")
})

const SpareForm = ({
  initialData = null,
  mode = "create",
  onSubmit,
  formRef
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(mode === "stock" ? replenishSchema : spareSchema),
    defaultValues: {
      code: "",
      type: "",
      brand: "",
      description: "",
      pricing_currency: "ARS",
      price: 0,
      markup_percent: 45,
      stock: 0
    }
  });

  useEffect(() => {
    if (!initialData) return;

    reset({
      code: initialData.code,
      type: initialData.type,
      brand: initialData.brand,
      description: initialData.description,
      pricing_currency: initialData.pricing_currency,
      price:
        initialData.pricing_currency === "ARS"
          ? initialData.cost_ars
          : initialData.price_usd,
      markup_percent: initialData.markup_percent ?? 45,
      stock: initialData.stock
    });
  }, [initialData, reset]);

  const currency = watch("pricing_currency");
  const price = watch("price");
  const markup = watch("markup_percent") ?? 45;
  const finalPrice = useMemo(() => {
    if (currency !== "ARS") return null;
    return Math.round(price * (1 + markup / 100));
  }, [price, markup, currency]);

  const onValid = (data) => {
    const cleanNumber = (v) => (isNaN(v) ? 0 : Number(v));

    // Modo reposición
    if (mode === "stock") {
      onSubmit({
        delta: cleanNumber(data.stock),
        cost_ars: cleanNumber(data.price),
      });
      return;
    }

    const payload = {
      code: data.code,
      type: data.type,
      brand: data.brand,
      description: data.description,
      stock: cleanNumber(data.stock),
      pricing_currency: data.pricing_currency,
      markup_percent: cleanNumber(data.markup_percent)
    };

    if (data.pricing_currency === "USD") {
      payload.price_usd = cleanNumber(data.price);
    } else {
      payload.cost_ars = cleanNumber(data.price);
      payload.is_legacy_pricing = false;
    }

    onSubmit(payload);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onValid)}
      className="flex flex-col gap-5"
    >
      {/* Formulario de reposición */}
      {mode === "stock" && (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800">Cantidad a agregar *</label>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-800">Costo unitario (ARS) *</label>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Formulario normal */}
      {mode !== "stock" && (
        <div className="flex flex-col gap-5">

          <div className="space-y-6">
            {/* Primer bloque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800">Tipo de repuesto *</label>
                <select
                  className="border border-gray-300 rounded-md p-2"
                  {...register("type")}
                  disabled={mode !== "create"}
                >
                  <option value="">Seleccionar repuesto</option>
                  {SPARE_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm">{errors.type.message}</p>
                )}
              </div>
              {/* Código */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800">Código *</label>
                <input
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                  {...register("code")}
                  disabled={mode !== "create"}
                />
                {errors.code && (
                  <p className="text-red-500 text-sm">{errors.code.message}</p>
                )}
              </div>
            </div>
            
            {/* Marca */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-800">Marca *</label>
              <input
                className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("brand")}
                disabled={mode === "stock"}
              />
              {errors.brand && (
                <p className="text-red-500 text-sm">{errors.brand.message}</p>
              )}
            </div>
            
            {/* Descripción */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800">Descripción *</label>
              <textarea
                rows={3}
                className="h-24 border border-gray-300 rounded-md p-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("description")}
                disabled={mode === "stock"}
              />
              {errors.description && (
                <p className="text-red-500 text-sm">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800">
                Stock *
              </label>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm">{errors.stock.message}</p>
              )}
            </div>

            {/* Moneda */}
            <div className="flex flex-col">
              <label>Moneda *</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="ARS"
                    {...register("pricing_currency")}
                  />
                  Pesos (ARS)
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="USD"
                    {...register("pricing_currency")}
                  />
                  Dólares (USD)
                </label>
              </div>
            </div>

            {/* Precio */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-800">
                {currency === "USD"
                  ? "Precio USD *"
                  : "Costo unitario (ARS) *"}
              </label>
              <input
                type="number"
                className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                {...register("price", { valueAsNumber: true })}
                disabled={mode === "stock"}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}
            </div>
            
            {/* Markup */}
            {currency === "ARS" && mode !== "stock" && (
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-800">
                  Markup (%)
                </label>
                <input
                  type="number"
                  className="h-12 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition"
                  {...register("markup_percent", { valueAsNumber: true })}
                />
              </div>
            )}
          </div>
          {/* Precio final */}
          {currency === "ARS" && mode !== "stock" && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              Precio de venta estimado:{" "}
              <strong className="text-gray-800">
                ${finalPrice}
              </strong>
            </div>
          )}
          
        </div>
      )}
    </form>
  );
};

export default SpareForm;