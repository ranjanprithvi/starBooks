import {
    Button,
    Divider,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import useAuthors from "../hooks/useAuthors";
import { Author } from "../models/author";

interface Props {
    selectedAuthor: Author | null;
    onSelectAuthor: (author: Author | null) => void;
}

const AuthorSelector = ({ selectedAuthor, onSelectAuthor }: Props) => {
    const { authors, error } = useAuthors();
    if (error) return null;

    return (
        <Menu>
            <MenuButton marginX="5" as={Button} rightIcon={<BsChevronDown />}>
                {" "}
                {selectedAuthor ? selectedAuthor.name : "All Authors"}
            </MenuButton>
            <MenuList height="50vh" overflow="scroll">
                <MenuItem onClick={() => onSelectAuthor(null)}>
                    All Authors
                </MenuItem>
                <Divider marginBottom={2} />
                {authors.map((author) => (
                    <MenuItem
                        key={author._id}
                        onClick={() => onSelectAuthor(author)}
                    >
                        {author.name}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>
    );
};

export default AuthorSelector;
