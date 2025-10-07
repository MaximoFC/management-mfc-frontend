import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SPARE_TYPES } from "../constants/spareTypes";

const getSchemaByMode = (mode) => {
  if (mode === "replenish") {
    return z.object({
      stock: z.number().min(1, "Debe ingresar al menos 1 unidad"),
      amount: z.number().min(0, "Debe ingresar el costo de compra"),
    });
  }

  const base = z.object({
    code: z.string().min(1, "El código es obligatorio"),
    type: z.string().min(1, "Debe seleccionar un tipo de repuesto"),
    brand: z.string().min(1, "La marca es obligatoria"),
    price: z.number().min(0, "El precio debe ser mayor o igual a 0"),
    stock: z.number().min(0, "El stock debe ser mayor o igual a 0"),
    description: z.string().min(1, "La descripción es obligatoria"),
  });

  if (mode === "create") {
    return base.extend({
      amount: z.number().min(0, "Debe ingresar el costo de compra"),
    });
  }

  return base;
};

const SpareForm = ({ initialData = {}, onSubmit, mode = "create" }) => {
  const schema = getSchemaByMode(mode);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      type: "",
      brand: "",
      description: "",
      price_usd: "",
      stock: "",
      amount: "",
      ...initialData,
    },
  });

  const onValid = (data) => {
    onSubmit({
      ...data,
      stock: Number(data.stock),
      price_usd: Number(data.price),
      amount: Number(data.amount),
    });
  };

  return (
    <div className="flex items-center justify-center h-dvh px-4">
      <form
        onSubmit={handleSubmit(onValid)}
        className="p-4 sm:p-6 flex flex-col justify-center gap-4 rounded-md shadow-md border border-gray-200 bg-white w-full max-w-2xl"
      >
        <h2 className="text-2xl font-bold text-center sm:text-left">
          {mode === "create"
            ? "Agregar nuevo repuesto"
            : mode === "update"
            ? "Editar repuesto"
            : "Reponer stock"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mode !== "replenish" && (
            <>
              <div className="flex flex-col">
                <label htmlFor="type">Tipo de repuesto *</label>
                <select
                  className="border border-gray-300 rounded-md p-2"
                  id="type"
                  {...register("type")}
                >
                  <option value="">Seleccionar repuesto</option>
                  {SPARE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm">{errors.type.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="code">Código *</label>
                <input
                  className="border border-gray-300 rounded-md p-2"
                  type="text"
                  id="code"
                  {...register("code")}
                  placeholder="Ej: AB500"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm">{errors.code.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="brand">Marca *</label>
                <input
                  className="border border-gray-300 rounded-md p-2"
                  type="text"
                  id="brand"
                  {...register("brand")}
                  placeholder="Ej: Shimano"
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm">{errors.brand.message}</p>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="price">Precio (USD) *</label>
                <input
                  className="border border-gray-300 rounded-md p-2"
                  type="number"
                  id="price_usd"
                  {...register("price_usd", { valueAsNumber: true })}
                  placeholder="Precio en dólares"
                />
                {errors.price_usd && (
                  <p className="text-red-500 text-sm">{errors.price_usd.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label htmlFor="stock">
              {mode === "replenish" ? "Cantidad a agregar *" : "Stock *"}
            </label>
            <input
              className="border border-gray-300 rounded-md p-2"
              type="number"
              id="stock"
              {...register("stock", { valueAsNumber: true })}
              placeholder="Cantidad"
            />
            {errors.stock && (
              <p className="text-red-500 text-sm">{errors.stock.message}</p>
            )}
          </div>

          {mode !== "update" && (
            <div className="flex flex-col">
              <label htmlFor="amount">Costo unitario (ARS) *</label>
              <input
                type="number"
                className="border border-gray-300 rounded-md p-2"
                id="amount"
                {...register("amount", { valueAsNumber: true })}
                placeholder="Costo en pesos"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm">{errors.amount.message}</p>
              )}
            </div>
          )}
        </div>

        {mode !== "replenish" && (
          <div className="flex flex-col">
            <label htmlFor="description">Descripción *</label>
            <textarea
              className="border border-gray-300 rounded-md p-2"
              id="description"
              {...register("description")}
              placeholder="Descripción del producto"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>
        )}

        <button className="rounded-md bg-red-500 text-white cursor-pointer p-2 hover:bg-red-700">
          {mode === "update"
            ? "Guardar cambios"
            : mode === "replenish"
            ? "Reponer stock"
            : "Agregar repuesto"}
        </button>
      </form>
    </div>
  );
};

export default SpareForm;
