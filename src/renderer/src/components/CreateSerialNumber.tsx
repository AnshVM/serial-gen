import { Button, Input, Select, Text, useToast } from '@chakra-ui/react'
import { Model } from '@renderer/types'
import { useEffect, useState } from 'react'
import { ProductNames } from './CreateModel'

const COMPANY = 'EBM'

const dateToString = (date: Date) => {
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - offset * 60 * 1000)
  return date.toISOString().split('T')[0]
}

export default function CreateSerialNumber() {
  const [models, setModels] = useState<Model[]>()
  const [modelName, setModelName] = useState<string>('')
  const [productName, setProductName] = useState(ProductNames.InfiniPlus)
  const [date, setDate] = useState<Date>(new Date())
  const [batch, setBatch] = useState(1)
  const toast = useToast()

  const saveSerialNumber = async () => {
    for (let i = 0; i < batch; i++) {
      const generated = await window.api.createSerialNumber(modelName, COMPANY, Number(date))
      console.log(generated)
      if (!generated) {
        toast({
          title: 'Serial number failed',
          description: `There was an error while generating serial numbers`,
          status: 'error',
          duration: 9000,
          isClosable: true
        })
        return
      }
    }
    toast({
      title: 'Serial number generated',
      description: `${batch} serial numbers were generated`,
      status: 'success',
      duration: 2000,
      isClosable: true
    })
  }

  const refreshModels = () => {
    if (productName) {
      window.api
        .getModelsByProductName(productName)
        .then((models: Model[]) => {
          setModels(models)
          setModelName(models[0].name)
        })
        .catch(() => console.log('Error while fetching models'))
    }
  }

  useEffect(() => {
    refreshModels()
  }, [productName])

  return (
    <div className="pt-4 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-center text-teal-700">Generate Serial Number</h1>
      <div className="flex flex-row justify-center gap-10">
        <div className="flex flex-col">
          <Text>Company name</Text>
          <Input width={60} value={COMPANY} onChange={() => {}} />
        </div>
        <div className="flex flex-col">
          <Text>Product Name</Text>
          <Select
            value={productName}
            onChange={(e) => setProductName(e.target.value as ProductNames)}
          >
            <option value={ProductNames.InfiniPlus}>{ProductNames.InfiniPlus}</option>
            <option value={ProductNames.InfiniPro}>{ProductNames.InfiniPro}</option>
            <option value={ProductNames.InfiniStor}>{ProductNames.InfiniStor}</option>
            <option value={ProductNames.DataBox}>{ProductNames.DataBox}</option>
          </Select>
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
        <div className="flex flex-col">
          <Text>Batch</Text>
          <Input type="number" value={batch} onChange={(e) => setBatch(Number(e.target.value))} />
        </div>
        <div className="flex flex-col">
          <Text>Date (optional) </Text>
          <Input
            type="date"
            value={dateToString(date)}
            onChange={(e) => {
              console.log('Date: ' + e.target.value)
              setDate(new Date(e.target.value))
            }}
          />
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
