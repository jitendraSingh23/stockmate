import SignUp from "@/components/SignUpComponent";
import { Suspense } from "react";

function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUp />
    </Suspense>
  );
}

export default SignUpPage;
