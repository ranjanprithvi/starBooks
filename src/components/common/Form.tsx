import { FieldValues, Path, useForm } from "react-hook-form";
import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Heading,
    Input,
    Select,
    Slider,
    SliderFilledTrack,
    SliderMark,
    SliderThumb,
    SliderTrack,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
}

interface SliderMarks {
    value: number;
    label: string;
}

export interface Field<T> {
    type: "textInput" | "textArea" | "select" | "slider";
    label: string;
    name: Path<T>;
    inputType?: string;
    pattern?: string;
    options?: Option[];
    // sliderMarks?: SliderMarks[] | number[];
    // sliderMarks?: number[];
    // min?: number;
    // max?: number;
    placeholder?: string;
}

interface Props<T extends FieldValues> {
    resolver?: any;
    fields: Field<T>[];
    heading: string;
    onSubmit: (data: T) => void;
    resetObject?: T;
    resetDependencies?: any[];
}

const Form = <T extends FieldValues>({
    fields,
    heading,
    onSubmit,
    resolver,
    resetObject,
    resetDependencies,
}: Props<T>) => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
    } = useForm<T>({
        resolver,
    });

    useEffect(
        () => {
            resetObject && reset(resetObject);
        },
        resetDependencies ? [...resetDependencies] : []
    );

    function renderInput({ label, name, inputType, pattern }: Field<T>) {
        return (
            <FormControl>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <Input
                    step="any"
                    id={name}
                    type={inputType}
                    pattern={pattern}
                    {...register(name, {
                        valueAsNumber:
                            inputType == "number" || inputType == "tel",
                    })}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()} // Prevents scrolling from skewing number input
                />
            </FormControl>
        );
    }

    function renderTextArea({ label, name }: Field<T>) {
        return (
            <FormControl>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <Textarea id={name} {...register(name)} />
            </FormControl>
        );
    }

    // function renderNumberInput({ label, name }: Field<T>) {
    //     return (
    //         <>
    //             <FormLabel htmlFor={name}>{label}</FormLabel>
    //             <NumberInput id={name}>
    //                 <NumberInputField
    //                     {...register(name, { valueAsNumber: true })}
    //                 />
    //                 <NumberInputStepper>
    //                     <NumberIncrementStepper />
    //                     <NumberDecrementStepper />
    //                 </NumberInputStepper>
    //             </NumberInput>
    //         </>
    //     );
    // }

    function renderSelect({
        label,
        name,
        options,
        placeholder,
        inputType,
    }: Field<T>) {
        return (
            <FormControl>
                <FormLabel htmlFor={name}>{label}</FormLabel>
                <Select
                    placeholder={placeholder}
                    {...register(name, {
                        valueAsNumber: inputType == "number",
                    })}
                    id={name}
                >
                    {options?.map((option) => (
                        <option
                            key={option.label + "_" + option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </Select>
            </FormControl>
        );
    }

    // function renderSlider({ label, name, min, max }: Field<T>) {
    //     return (
    //         <FormControl>
    //             <FormLabel htmlFor={name}>{label}</FormLabel>
    //             <Slider
    //                 min={min}
    //                 max={max}
    //                  {...register(name, { valueAsNumber: true})}
    //             >
    //                 <SliderTrack >
    //                     <SliderFilledTrack />
    //                 </SliderTrack>
    //                 <SliderThumb boxSize={5} />
    //             </Slider>
    //         </FormControl>
    //     );
    // }

    // function renderSlider({ label, name, sliderMarks }: Field<T>) {
    //     return (
    //         <FormControl>
    //             <FormLabel htmlFor={name}>{label}</FormLabel>
    //             <Slider>
    //                 {sliderMarks?.map(
    //                     (mark) => (
    //                         // {
    //                         // return typeof mark == "number" ? (
    //                         <SliderMark key={mark} value={mark}>
    //                             {mark}
    //                         </SliderMark>
    //                     )
    //                     // ) : (
    //                     //     <SliderMark key={mark.value} value={mark.value}>
    //                     //         {mark.label || mark.value}
    //                     //     </SliderMark>
    //                     // );
    //                     // }
    //                 )}
    //                 <SliderTrack>
    //                     <SliderFilledTrack />
    //                 </SliderTrack>
    //                 <SliderThumb />
    //             </Slider>
    //         </FormControl>
    //     );
    // }

    function renderField(field: Field<T>) {
        let renderElement: (arg0: Field<T>) => JSX.Element;
        switch (field.type) {
            case "select":
                renderElement = renderSelect;
                break;
            // case "slider":
            //     renderElement = renderSlider;
            //     break;
            // case "numberInput":
            //     renderElement = renderNumberInput;
            //     break;
            case "textArea":
                renderElement = renderTextArea;
                break;
            default:
                renderElement = renderInput;
        }

        return (
            <>
                {renderElement(field)}
                <FormErrorMessage>
                    {errors[field.name]?.message?.toString()}
                </FormErrorMessage>
            </>
        );
    }

    // console.log(errors, isValid);

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <VStack>
                <Heading marginBottom="5">{heading}</Heading>
                {fields.map((field) => (
                    <FormControl
                        key={field.name}
                        marginBottom={3}
                        isInvalid={errors[field.name] ? true : false}
                    >
                        {renderField(field)}
                    </FormControl>
                ))}

                <HStack justifyContent="flex-end">
                    {/* <Button isDisabled={!isValid} colorScheme="green" type="submit"> */}
                    <Button colorScheme="green" type="submit" id="submit">
                        Submit
                    </Button>
                    <Button onClick={() => navigate(-1)} colorScheme="gray">
                        Cancel
                    </Button>
                </HStack>
            </VStack>
        </form>
    );
};

export default Form;
