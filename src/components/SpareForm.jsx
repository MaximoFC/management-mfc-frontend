import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SPARE_TYPES } from "../constants/spareTypes";
import { useState } from "react";

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
    price_usd: z.number().min(0, "El precio debe ser mayor o igual a 0").refine(
      (val) => /^\d+(\.\d{1,2})?$/.test(val.toString()),
      { message: "Máximo 2 decimales" }
    ),
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

const SpareForm = ({ initialData = {}, onSubmit, mode = "create", onSubmitFromModal = false, formRef }) => {
  const schema = getSchemaByMode(mode);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onValid = async (data) => {
    setIsSubmitting(true);
    try {
        await onSubmit({
        ...data,
        stock: Number(data.stock),
        price_usd: Number(data.price_usd),
        amount: Number(data.amount),
      });
    } finally {
      setIsSubmitting(false);
    }
    
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onValid)}
      className="flex flex-col gap-5"
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
                step="0.01"
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

      {!onSubmitFromModal && (
        <button
          disabled={isSubmitting}
          className={`rounded-md text-white p-2 transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-700"
          }`}
        >
          {isSubmitting
            ? "Guardando..."
            : mode === "update"
            ? "Guardar cambios"
            : mode === "replenish"
            ? "Reponer stock"
            : "Agregar repuesto"}
        </button>
      )}
    </form>
  );
};

export default SpareForm;
