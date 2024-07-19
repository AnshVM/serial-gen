import { useState } from "react"
import CreateModel from "./components/CreateModel"
import CreateSerialNumber from "./components/CreateSerialNumber"

function App(): JSX.Element {

  const [updated, setUpdated] = useState(false);

  return (
    <>
      <CreateModel updated={updated} setUpdated={setUpdated}/>
      <CreateSerialNumber updated={updated} setUpdated={setUpdated}/>
    </>
  )
}

export default App
