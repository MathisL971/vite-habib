import { AxiosError } from "axios";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error: unknown = useRouteError();
  console.error(error);

  let message = "An unexpected error has occurred.";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  } else if (error instanceof AxiosError) {
    message = error.response?.data?.message
  }

  return (
    <div id="error-page" className="flex flex-col gap-5 w-screen h-screen justify-center items-center">
      <h1 className="text-6xl font-bold">Oops!</h1>
      <p className="text-lg">Sorry, an error has occurred. See the message under for more information.</p>
      <p>
        <i>{message}</i>
      </p>
    </div>
  );
}