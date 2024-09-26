import * as Yup from "yup";

Yup.addMethod(Yup.string, "minTrim", function (min: number, message: string) {
    return this.test("min-trim", message, value => {
        const trimmedValue = value?.replace(/\s/g, "") ?? "";
        return trimmedValue.length >= min;
    });
});

export default Yup;
