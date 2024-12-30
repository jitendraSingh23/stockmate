import SignIn from "@/components/SignInComponent";
import { Suspense } from "react";

function SignINPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignIn />
    </Suspense>
  );
}

export default SignINPage;
