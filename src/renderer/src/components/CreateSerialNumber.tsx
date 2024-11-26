import { Button, Input, Select, Text, useToast } from '@chakra-ui/react'
import { Model } from '@renderer/types'
import { useEffect, useState } from 'react'

const COMPANY = 'EBM'

export default function CreateSerialNumber() {
  const [models, setModels] = useState<Model[]>()
  const [modelName, setModelName] = useState<string>('')
  const toast = useToast()

  const saveSerialNumber = async () => {
    const generated = await window.api.createSerialNumber(modelName, COMPANY)
    if (generated) {
      toast({
        title: 'Serial number generated',
        description: `Serial number: ${generated}`,
        status: 'success',
        duration: 9000,
        isClosable: true
      })
    } else {
      toast({
        title: 'Serial number failed',
        description: `There was an error while generating serial numbers`,
        status: 'error',
        duration: 9000,
        isClosable: true
      })
    }
  }

  const refreshModels = () => {
    window.api
      .getModels()
      .then((models: Model[]) => {
        setModels(models)
        setModelName(models[0].name)
      })
      .catch(() => console.log('Error while fetching models'))
  }

  useEffect(() => {
    refreshModels()
  }, [])

  return (
    <div className="pt-4 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-center text-teal-700">Generate Serial Number</h1>
      <div className="flex flex-row justify-center gap-10">
        <div className="flex flex-col">
          <Text>Company name</Text>
          <Input width={60} value={COMPANY} onChange={() => {}} />
        </div>
        <div className="flex flex-col">
          <Text>Model name</Text>
          <Select onChange={(e) => setModelName(e.target.value)} value={modelName} width={60}>
            {models &&
              models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name} - {model.productName}
                </option>
              ))}
          </Select>
        </div>
      </div>
      <Button
        colorScheme="teal"
        variant={'solid'}
        className="w-fit mx-auto"
        onClick={saveSerialNumber}
      >
        Generate Serial Number
      </Button>
    </div>
  )
}
