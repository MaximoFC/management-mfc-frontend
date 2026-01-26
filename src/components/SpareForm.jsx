import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SPARE_TYPES } from "../constants/spareTypes";
import {
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo
} from "react";

const spareSchema = z.object({
  code: z.string().min(1, "El código es obligatorio"),
  type: z.string().refine(v => SPARE_TYPES.includes(v), {
    message: "Debe seleccionar un tipo válido"
  }),
  brand: z.string().min(1, "La marca es obligatoria"),
  description: z.string().min(1, "La descripción es obligatoria"),
  pricing_currency: z.enum(["USD", "ARS"]),
  price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
  markup_percent: z.number().min(0).max(100).optional(),
  stock: z.number().min(0, "El stock debe ser mayor o igual a 0")
});

const SpareForm = forwardRef(
  ({ initialData = null, mode = "create", onSubmit }, ref) => {
    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors }
    } = useForm({
      resolver: zodResolver(spareSchema),
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

    const submit = handleSubmit(data => {
      const payload = {
        code: data.code,
        type: data.type,
        brand: data.brand,
        description: data.description,
        stock: data.stock,
        pricing_currency: data.pricing_currency,
        markup_percent: data.markup_percent
      };

      if (data.pricing_currency === "USD") {
        payload.price_usd = data.price;
      } else {
        payload.cost_ars = data.price;
        payload.is_legacy_pricing = false;
      }

      onSubmit(payload);
    });

    useImperativeHandle(ref, () => ({ submit }));

    return (
      <div className="flex flex-col gap-5">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Tipo */}
          <div className="flex flex-col">
            <label>Tipo de repuesto *</label>
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
            <label>Código *</label>
            <input
              className="border border-gray-300 rounded-md p-2"
              {...register("code")}
              disabled={mode !== "create"}
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          {/* Marca */}
          <div className="flex flex-col">
            <label>Marca *</label>
            <input
              className="border border-gray-300 rounded-md p-2"
              {...register("brand")}
              disabled={mode === "stock"}
            />
            {errors.brand && (
              <p className="text-red-500 text-sm">{errors.brand.message}</p>
            )}
          </div>

          {/* Moneda */}
          <div className="flex flex-col">
            <label>Moneda *</label>
            <select
              className="border border-gray-300 rounded-md p-2"
              {...register("pricing_currency")}
              disabled={mode !== "create"}
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>

          {/* Precio */}
          <div className="flex flex-col">
            <label>
              {currency === "USD"
                ? "Precio USD *"
                : "Costo unitario (ARS) *"}
            </label>
            <input
              type="number"
              className="border border-gray-300 rounded-md p-2"
              {...register("price", { valueAsNumber: true })}
              disabled={mode === "stock"}
            />
            {errors.price && (
              <p className="text-red-500 text-sm">{errors.price.message}</p>
            )}
          </div>

          {/* Stock */}
          <div className="flex flex-col">
            <label>Stock *</label>
            <input
              type="number"
              className="border border-gray-300 rounded-md p-2"
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm">{errors.stock.message}</p>
            )}
          </div>

          {/* Markup */}
          {currency === "ARS" && mode !== "stock" && (
            <div className="flex flex-col">
              <label>Markup (%)</label>
              <input
                type="number"
                className="border border-gray-300 rounded-md p-2"
                {...register("markup_percent", { valueAsNumber: true })}
              />
            </div>
          )}
        </div>

        {/* Precio final */}
        {currency === "ARS" && mode !== "stock" && (
          <div className="bg-gray-100 rounded-md p-3 text-sm">
            Precio de venta estimado:{" "}
            <strong className="text-gray-800">
              ${finalPrice}
            </strong>
          </div>
        )}

        {/* Descripción */}
        <div className="flex flex-col">
          <label>Descripción *</label>
          <textarea
            className="border border-gray-300 rounded-md p-2"
            {...register("description")}
            disabled={mode === "stock"}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">
              {errors.description.message}
            </p>
          )}
        </div>

      </div>
    );
  }
);

export default SpareForm;