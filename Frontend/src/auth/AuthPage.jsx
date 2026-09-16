import * as React from "react";
import { useSearchParams } from "react-router-dom";
import SignIn from "./SignIn";
import SignUp from "./SignUp";

export default function AuthPage() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") === "signup" ? "signup" : "signin";

    return mode === "signup" ? <SignUp /> : <SignIn />;
}
