import { useState } from "react"
import CreateModel from "./components/CreateModel"
import CreateSerialNumber from "./components/CreateSerialNumber"
import { Link } from "@chakra-ui/react";
import SerialNumbers from "./components/SerialNumbers";

enum Pages {
  GEN_SERIAL_NOS,
  VIEW_SERIAL_NOS,
  CREATE_MODELS
}

function App(): JSX.Element {

  const [page, setPage] = useState<Pages>();

  return (
    <>
      <div className="flex flex-row gap-4 p-1">
        <Link onClick={() => setPage(Pages.CREATE_MODELS)}>Create Model</Link>
        <Link onClick={() => setPage(Pages.GEN_SERIAL_NOS)}>Generate Serial Numbers</Link>
        <Link onClick={() => setPage(Pages.VIEW_SERIAL_NOS)}>View Serial Numbers</Link>
      </div>
      {page === Pages.CREATE_MODELS && <CreateModel />}
      {page === Pages.GEN_SERIAL_NOS && <CreateSerialNumber />}
      {page === Pages.VIEW_SERIAL_NOS && <SerialNumbers />}
    </>
  )
}

export default App
