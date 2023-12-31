import { Box, GridItem, useToast } from "@chakra-ui/react";
import Form, { Field, Option } from "../common/Form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import _ from "lodash";
import { httpService } from "../../services/http-service";
import { Rental } from "../../models/rental";
import useBooks from "../../hooks/useBooks";
import useUsers from "../../hooks/useUsers";

const schema = z.object({
    book: z
        .string({ invalid_type_error: "Book is required" })
        .nonempty({ message: "Book is required" }),
    user: z
        .string({ invalid_type_error: "User is required" })
        .nonempty({ message: "User is required" }),
});

type RentalData = z.infer<typeof schema>;

const RentalForm = () => {
    const useQuery = () => new URLSearchParams(useLocation().search);
    const query = useQuery();

    const navigate = useNavigate();
    const toast = useToast();
    const { id } = useParams();
    if (!id) return null;

    const resolver = zodResolver(schema);

    const { books } = useBooks();
    const { users } = useUsers({ isAdmin: false });

    const resetObject = {
        user: query.get("user") || "",
        book: query.get("book") || "",
    };

    const resetDependencies = [users, books];

    if (id != "new") navigate("/not-found");

    const onSubmit = (data: RentalData) => {
        let rentalService = httpService("/rentals");
        rentalService
            .post<RentalData, Rental>(data)
            .then((res) => {
                navigate("/rentals", {
                    replace: true,
                });
            })
            .catch((err) => {
                toast({
                    title: "Error",
                    description: err.response?.data?.toString(),
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            });
    };

    const fields: Field<RentalData>[] = [
        {
            type: "select",
            label: "Book",
            name: "book",
            options: books.map(
                (book) =>
                    ({
                        value: book._id,
                        label: book.title,
                        disabled: book.numberInStock == 0,
                    } as Option)
            ),
            placeholder: "--Select book--",
        },
        {
            type: "select",
            label: "User",
            name: "user",
            options: users.map(
                (user) =>
                    ({
                        value: user._id,
                        label: user.name,
                        disabled: user.activeRentals?.length >= user.maxBorrow,
                    } as Option)
            ),
            placeholder: "--Select user--",
        },
    ];

    return (
        <GridItem colSpan={2} marginX={5}>
            <Box
                marginX={"auto"}
                borderColor={"blue.800"}
                borderWidth={"medium"}
                borderRadius={"xl"}
                padding={10}
                maxWidth={"600px"}
            >
                <Form<RentalData>
                    resolver={resolver}
                    fields={fields}
                    heading={"New Rental"}
                    onSubmit={onSubmit}
                    resetObject={resetObject}
                    resetDependencies={resetDependencies}
                />
            </Box>
        </GridItem>
    );
};

export default RentalForm;
