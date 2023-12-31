import "@testing-library/jest-dom";
import LoginForm from "../../../src/components/LoginForm";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { LoginContext } from "../../../src/contexts/loginContext";
import apiClient from "../../../src/services/api-client";
import { useToast } from "../../../src/hooks/generic/useToast";
import React from "react";
// import mockAxios from "jest-mock-axios";

const correctEmail = "correctEmail@starbooks.com";
const correctPassword = "correctPassword";
const wrongEmail = "wrongEmail@starbooks.com";

const mSetLoggedIn = jest.fn();

//mock window.location.replace
const mockReplace = jest.fn();
Object.defineProperty(window, "location", {
    value: {
        replace: mockReplace,
    },
});

//mock apiClient
jest.mock("../../../src/services/api-client");
const mApiClient = apiClient as jest.Mocked<typeof apiClient>;

//mock useToast
const mShowError = jest.fn();
const mShowSuccess = jest.fn();
jest.mock("../../../src/hooks/generic/useToast");
const mUseToast = useToast as jest.MockedFunction<typeof useToast>;
mUseToast.mockReturnValue({
    showError: mShowError,
    showSuccess: mShowSuccess,
});

//mock useNavigate
const mUseNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...(jest.requireActual("react-router-dom") as any),
    useNavigate: () => mUseNavigate,
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe("LoginForm", () => {
    it("renders", async () => {
        render(<LoginForm />);

        expect(screen.getByText(/email/i)).toBeInTheDocument();
        expect(screen.getByText(/password/i)).toBeInTheDocument();
        expect(screen.getByText(/submit/i)).toBeInTheDocument();
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
    });

    it("calls the post method with the credentials when both email and password are entered", async () => {
        mApiClient.post.mockResolvedValueOnce({
            data: { token: "1234", isAdmin: true },
        });
        render(
            <LoginContext.Provider
                value={{
                    isLoggedIn: false,
                    setLoggedIn: mSetLoggedIn,
                    isAdmin: false,
                    setAdmin: jest.fn(),
                }}
            >
                <LoginForm />
            </LoginContext.Provider>
        );

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: correctEmail },
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: correctPassword },
            });
            const loginButton = screen.getByText(
                /submit/i
            ) as HTMLButtonElement;
            loginButton.click();
        });

        expect(mApiClient.post).toHaveBeenCalledWith("/auth/login", {
            email: correctEmail,
            password: correctPassword,
        });
        expect(mockReplace).toHaveBeenCalledWith("/books");
    });

    it("does not attempt login when no email is entered", async () => {
        render(
            <LoginContext.Provider
                value={{
                    isLoggedIn: false,
                    setLoggedIn: mSetLoggedIn,
                    isAdmin: false,
                    setAdmin: jest.fn(),
                }}
            >
                <LoginForm />
            </LoginContext.Provider>
        );

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: correctPassword },
            });
            const loginButton = screen.getByText(
                /submit/i
            ) as HTMLButtonElement;
            loginButton.click();
        });

        expect(mApiClient.post).not.toHaveBeenCalled();
    });

    it("does not attempt login when no password is entered", async () => {
        render(
            <LoginContext.Provider
                value={{
                    isLoggedIn: false,
                    setLoggedIn: mSetLoggedIn,
                    isAdmin: false,
                    setAdmin: jest.fn(),
                }}
            >
                <LoginForm />
            </LoginContext.Provider>
        );
        await act(async () => {
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: correctEmail },
            });
            const loginButton = screen.getByText(
                /submit/i
            ) as HTMLButtonElement;
            loginButton.click();
        });

        expect(mApiClient.post).not.toHaveBeenCalled();
    });

    it("displays error message in case of bad request", async () => {
        const message = "Invalid username or password";
        mApiClient.post.mockRejectedValueOnce({
            response: {
                data: message,
            },
        });

        render(
            <LoginContext.Provider
                value={{
                    isLoggedIn: false,
                    setLoggedIn: mSetLoggedIn,
                    isAdmin: false,
                    setAdmin: jest.fn(),
                }}
            >
                <LoginForm />
            </LoginContext.Provider>
        );

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: wrongEmail },
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: correctPassword },
            });

            const loginButton = screen.getByText(
                /submit/i
            ) as HTMLButtonElement;
            loginButton.click();
        });

        expect(mShowError).toHaveBeenCalledWith(message);

        // expect(
        //     await screen.findByText(/invalid username or password/i)
        // ).toBeInTheDocument();
    });

    it("displays error message in case of network error", async () => {
        const message = "Sorry. Something went wrong";
        mApiClient.post.mockRejectedValueOnce({
            response: "Error",
        });
        mApiClient.post.mockResolvedValueOnce({
            data: { token: "1234", isAdmin: true },
        });
        process.env.VITE_BACKEND_URL = "http://invalidUrl";
        render(
            <LoginContext.Provider
                value={{
                    isLoggedIn: false,
                    setLoggedIn: mSetLoggedIn,
                    isAdmin: false,
                    setAdmin: jest.fn(),
                }}
            >
                <LoginForm />
            </LoginContext.Provider>
        );

        await act(async () => {
            fireEvent.change(screen.getByLabelText(/email/i), {
                target: { value: correctEmail },
            });
            fireEvent.change(screen.getByLabelText(/password/i), {
                target: { value: correctPassword },
            });

            const loginButton = screen.getByText(
                /submit/i
            ) as HTMLButtonElement;
            loginButton.click();
        });

        expect(mShowError).toHaveBeenCalledWith(message);
    });

    it("navigates to previous screen when canceled", async () => {
        render(<LoginForm />);

        const cancelButton = screen.getByText(/cancel/i);
        cancelButton.click();
        expect(mUseNavigate).toHaveBeenCalledWith(-1);
    });
});
