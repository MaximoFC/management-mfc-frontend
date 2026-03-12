export const downloadBudgetPdf = (blob) => {

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "presupuesto.pdf";

    document.body.appendChild(a);
    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

};